import nodeCron from "node-cron";
import { ConfigLib, LibArticle, ScrapeConfigLib } from "./lib";
import dayjs from "dayjs";

// schedule for every 10 seconds
export const cron = nodeCron.schedule(
  ConfigLib.get().scrape.interval,
  async () => {
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    console.log("Scraping started...", now);
    const config = await ScrapeConfigLib.loadConfig();
    console.log("Config loaded:", config);
    const rs = await LibArticle.getArticles(config);
    console.log("Articles fetched:", rs.articles.length);
    ScrapeConfigLib.saveConfig(rs.config);
    rs.articles.forEach(async (article, index) => {
      const exportResult = await LibArticle.exportArticle(article);
      console.log(`Article ${article.id}[${index}] exported:`, exportResult);
      if (index >= 10) return;
    });
  }
);
