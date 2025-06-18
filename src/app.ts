import express from "express";
import { Config } from "./config";
import { VectorStore } from "./store";
import { router } from "./router";

const bootstrap = async () => {
  await VectorStore.instance
    .init()
    .then((result) => console.log("VectorStore initialized:", result));

  const app = express();
  const port = Config.get().app.port;

  app.use(express.json());
  app.use("/api/v1", router);
  app.listen(port, () => {
    console.log(`Server is running on port:${port}`);
  });
};

bootstrap();
