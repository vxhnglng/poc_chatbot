import fs from "fs";
import axios from "axios";
import dayjs from "dayjs";
import {
  IArticle,
  IArticleExportResponse,
  IArticleResponse,
  IScrapeConfig,
} from "../interface";
import TurndownService from "turndown";

export namespace LibArticle {
  export const getArticles = async (
    config: IScrapeConfig
  ): Promise<{
    config: IScrapeConfig;
    articles: IArticle[];
  }> => {
    const articles: IArticle[] = [];
    let newLatestUpdateTime = config.latestUpdateTime;
    let newLatestPage = config.latestPage;
    let url = `https://support.optisigns.com/api/v2/help_center/en-us/articles.json?per_page=100&sort_order=desc&sort_by=updated_at&page=${config.latestPage}`;

    // 100 attempts
    for (let i = 0; i < 100; i++) {
      const { data } = await axios.get<IArticleResponse>(url);
      newLatestPage = data.page;

      for (
        let articleIdx = 0, totalArticles = data.articles.length;
        articleIdx < totalArticles;
        articleIdx++
      ) {
        const article = data.articles[articleIdx];
        const isNewArticle = dayjs(article.updated_at).isAfter(
          dayjs(config.latestUpdateTime)
        );

        if (!isNewArticle) {
          return {
            articles,
            config: {
              latestPage: newLatestPage,
              latestUpdateTime: newLatestUpdateTime,
            },
          };
        }

        articles.push(article);
        newLatestUpdateTime = Math.max(
          newLatestUpdateTime,
          dayjs(article.updated_at).toDate().getTime()
        );
      }

      if (!data.next_page) {
        return {
          articles,
          config: {
            latestPage: newLatestPage,
            latestUpdateTime: newLatestUpdateTime,
          },
        };
      }

      url = data.next_page;
    }

    return {
      articles,
      config: {
        latestPage: newLatestPage,
        latestUpdateTime: newLatestUpdateTime,
      },
    };
  };

  export const exportArticle = async (
    article: IArticle
  ): Promise<IArticleExportResponse> => {
    const regex = new RegExp(`^.+/articles/${article.id}-`);
    const slug = article.html_url.replace(regex, "");
    const fileName = `./out/md/${slug}.md`;
    const turndownService = new TurndownService();
    turndownService.turndown(article.body);
    return new Promise((resolve) => {
      fs.writeFile(
        fileName,
        turndownService.turndown(article.body),
        "utf8",
        (err) => {
          if (err) {
            console.error(`Error writing file ${fileName}:`, err);
            resolve({
              success: false,
              article: {
                id: article.id,
                name: article.name,
                url: article.html_url,
                path: fileName,
              },
            });
            return;
          }

          resolve({
            success: true,
            article: {
              id: article.id,
              name: article.name,
              url: article.html_url,
              path: fileName,
            },
          });
        }
      );
    });
  };
}
