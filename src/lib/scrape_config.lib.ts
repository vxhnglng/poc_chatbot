import { IScrapeConfig } from "../interface";
import { RedisLib } from "./redis.lib";

export namespace ScrapeConfigLib {
  const redis = RedisLib.getRedis();

  export const loadConfig = async (): Promise<IScrapeConfig> => {
    try {
      const config = await redis.get("scrape:config");
      if (config) {
        return JSON.parse(config) as IScrapeConfig;
      }
    } catch (e) {
      console.error("Error loading config from Redis:", e);
    }

    return {
      latestUpdateTime: 0,
      latestPage: 1,
    };
  };

  export const saveConfig = async (config: IScrapeConfig): Promise<boolean> => {
    try {
      await redis.set("scrape:config", JSON.stringify(config));
      return true;
    } catch (e) {
      console.error("Error saving config to Redis:", e);
      return false;
    }
  };
}
