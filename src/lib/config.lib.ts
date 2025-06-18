import fs from "fs";
import { IScrapeConfig } from "../interface";

export namespace ConfigLib {
  export const loadConfig = async (): Promise<IScrapeConfig> => {
    return new Promise((resolve) => {
      fs.readFile("./out/config.json", "utf8", (err, data) => {
        if (err) {
          console.error(err);
          resolve({ latestUpdateTime: 0, latestPage: 1 });
          return;
        }

        const config: IScrapeConfig = JSON.parse(data);
        resolve(config);
      });
    });
  };

  export const saveConfig = async (config: IScrapeConfig): Promise<boolean> => {
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
}
