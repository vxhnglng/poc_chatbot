import nodeCron from "node-cron";
import { ConfigLib, ScrapeLib, ScrapeConfigLib } from "./lib";
import dayjs from "dayjs";
import { VectorStore } from "./store";

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

const bootstrap = async () => {
  await VectorStore.instance.init(ConfigLib.get().gen_ai.api_key);
  nodeCron.schedule(ConfigLib.get().scrape.interval, async () => {
    const rs = await scrapeArticles();
    for (
      let articleIdx = 0, totalArticles = rs.articles.length;
      articleIdx < totalArticles;
      articleIdx++
    ) {
      const article = rs.articles[articleIdx];
      ScrapeLib.exportArticle(article);
      if (articleIdx >= 10) return;
    }
  });
};

bootstrap();
