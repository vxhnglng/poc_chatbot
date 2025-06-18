import { LibArticle, ConfigLib } from "./lib";

const bootstrap = async () => {
  const config = await ConfigLib.loadConfig();
  console.log("Config loaded:", config);
  const rs = await LibArticle.getArticles(config);
  console.log("Articles fetched:", rs.articles.length);
  ConfigLib.saveConfig(rs.config);
  rs.articles.forEach(async (article, index) => {
    const exportResult = await LibArticle.exportArticle(article);
    console.log(`Article ${article.id}[${index}] exported:`, exportResult);
    if (index >= 10) return;
  });
};

bootstrap();
