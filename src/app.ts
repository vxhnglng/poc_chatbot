import express from "express";
import { Config } from "./config";

const bootstrap = async () => {
  const app = express();
  const port = Config.get().app.port;

  app.use(express.json());
  app.listen(port, () => {
    console.log(`Server is running on port:${port}`);
  });
};

bootstrap();
