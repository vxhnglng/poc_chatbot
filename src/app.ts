import { Lib } from "./lib";

const bootstrap = async () => {
  const config = await Lib.loadConfig();
  console.log("Config loaded:", config);
  const rs = await Lib.getArticles(config);
  console.log("Articles fetched:", rs.articles.length);
  Lib.saveConfig(rs.config);
  rs.articles.forEach(Lib.exportArticle);
};

bootstrap();
