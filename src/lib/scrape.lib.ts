import fs from "fs";
import axios from "axios";
import dayjs from "dayjs";
import {
  IArticle,
  IArticleExportResponse,
  IArticleResponse,
  IPagination,
  IScrapeConfig,
} from "../interface";
import TurndownService from "turndown";
import { LoggerLib } from "./logger.lib";
import { RedisLib } from "./redis.lib";

export namespace ScrapeLib {
  const redis = RedisLib.getRedis();

  const createLogScrape = () => {
    let totalScraped = 0;
    let totalAdded = 0;
    let totalUpdated = 0;
    const promises: Promise<any>[] = [];
    const buildMessage = (pagination: IPagination) => {
      const added = totalAdded;
      const updated = totalUpdated;
      const skipped = pagination.count - (added + updated);
      return `add: ${added} | updated: ${updated} | skipped: ${skipped}`;
    };

    return {
      scrape: (id: number) => {
        totalScraped += 1;
        promises.push(
          new Promise(async (resolve) => {
            const rs = await redis.incr(`scrape:articles:${id}`);
            const isAdded = rs === 1;
            if (isAdded) {
              totalAdded += 1;
              resolve(true);
              return;
            }

            totalUpdated += 1;
            resolve(true);
          })
        );
      },
      log: async (pagination: IPagination) => {
        await Promise.all(promises);
        LoggerLib.log(buildMessage(pagination));
      },
    };
  };

  export const getArticles = async (
    config: IScrapeConfig
  ): Promise<{
    config: IScrapeConfig;
    articles: IArticle[];
  }> => {
    const logger = createLogScrape();
    const articles: IArticle[] = [];
    let newLatestUpdateTime = config.latestUpdateTime;
    let newLatestPage = config.latestPage;
    let pagination: IPagination | undefined;
    let url = `https://support.optisigns.com/api/v2/help_center/en-us/articles.json?per_page=100&sort_order=asc&sort_by=updated_at&page=${config.latestPage}`;

    // 100 attempts
    for (
      let attempt = 0, max_attempts = 100;
      attempt < max_attempts;
      attempt++
    ) {
      const { data } = await axios.get<IArticleResponse>(url);
      pagination = data;
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

        if (!isNewArticle) continue;

        logger.scrape(article.id);
        articles.push(article);
        newLatestUpdateTime = Math.max(
          newLatestUpdateTime,
          dayjs(article.updated_at).toDate().getTime()
        );
      }

      if (!data.next_page) {
        logger.log(pagination);
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

    if (pagination) {
      logger.log(pagination);
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
    const content = turndownService.turndown(article.body);
    return new Promise((resolve) => {
      fs.writeFile(fileName, content, "utf8", (err) => {
        if (err) {
          console.error(`Error writing file ${fileName}:`, err);
          resolve({
            success: false,
            article: {
              id: article.id,
              slug,
              url: article.html_url,
              path: fileName,
              content,
            },
          });
          return;
        }

        resolve({
          success: true,
          article: {
            id: article.id,
            slug,
            url: article.html_url,
            path: fileName,
            content,
          },
        });
      });
    });
  };
}
