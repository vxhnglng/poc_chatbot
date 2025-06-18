import nodeCron from "node-cron";
import { ScrapeLib, ScrapeConfigLib } from "./lib";
import dayjs from "dayjs";
import { VectorStore } from "./store";
import { IArticle, IArticleExportResponse } from "./interface";
import { Config } from "./config";
import _ from "lodash";

const scrapeArticles = async () => {
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  console.log("Scraping started...", now);

  const config = await ScrapeConfigLib.loadConfig();
  console.log("Config loaded:", config);

  const rs = await ScrapeLib.getArticles(config);
  console.log("Articles fetched:", rs.articles.length);

  ScrapeConfigLib.saveConfig(rs.config);
  return rs;
};

const exportArticles = async (articles: IArticle[]) => {
  return await Promise.all(
    articles.map((article) => ScrapeLib.exportArticle(article))
  );
};

const embedAndStoreArticles = async (articles: IArticleExportResponse[]) => {
  const hasArticles = !!articles[0];
  if (!hasArticles) return;

  for (const articleChunk of _.chunk(articles, 100)) {
    const embedResult = await VectorStore.instance.embedAndStore(
      articleChunk.map(({ article }) => {
        return {
          id: article.slug,
          content: article.content,
        };
      })
    );

    console.log("Embedding and storing articles:", embedResult);
  }
};

const bootstrap = async () => {
  await VectorStore.instance.init();
  const task = nodeCron.schedule(Config.get().scrape.interval, async () => {
    const resultScrape = await scrapeArticles();
    const resultExport = await exportArticles(resultScrape.articles);
    await embedAndStoreArticles(resultExport);
  });

  task.execute();
};

bootstrap();
