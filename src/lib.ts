import fs, { writeFile } from "fs";
import axios from "axios";
import dayjs from "dayjs";
import { IArticle, IArticleResponse, IConfig } from "./interface";
import TurndownService from "turndown";

export namespace Lib {
  export const getArticles = async (
    config: IConfig
  ): Promise<{
    config: IConfig;
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

  export const loadConfig = async (): Promise<IConfig> => {
    return new Promise((resolve) => {
      fs.readFile("./out/config.json", "utf8", (err, data) => {
        if (err) {
          console.error(err);
          resolve({ latestUpdateTime: 0, latestPage: 1 });
          return;
        }

        const config: IConfig = JSON.parse(data);
        resolve(config);
      });
    });
  };

  export const saveConfig = async (config: IConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      fs.writeFile(
        "./out/config.json",
        JSON.stringify(config, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error(err);
            resolve(false);
            return;
          }

          console.log(`Config saved successfully:`, config);
          resolve(true);
        }
      );
    });
  };

  export const exportArticle = async (article: IArticle) => {
    const fileName = `./out/md/${article.id}.md`;
    const turndownService = new TurndownService();
    turndownService.turndown(article.body);
    writeFile(
      fileName,
      turndownService.turndown(article.body),
      "utf8",
      (err) => {
        if (err) {
          console.error(`Error writing file ${fileName}:`, err);
          return;
        }
        console.log(`Article ${article.id} exported to ${fileName}`);
      }
    );
  };
}
