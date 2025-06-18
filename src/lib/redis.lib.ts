import Redis from "ioredis";
import { Config } from "../config";

export namespace RedisLib {
  export const getRedis = () => {
    return new Redis(Config.get().redis);
  };
}
