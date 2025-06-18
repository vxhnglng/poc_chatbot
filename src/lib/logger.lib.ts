import dayjs from "dayjs";
import { RedisLib } from "./redis.lib";

export namespace LoggerLib {
  const MAX_LOGS = 1000;
  const redis = RedisLib.getRedis();

  export const log = async (message: string): Promise<void> => {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const logMessage = `[${timestamp}] - ${message}`;
    const totalLogs = await redis.rpush("logs", logMessage);
    if (totalLogs > MAX_LOGS) {
      await redis.ltrim("logs", 0, MAX_LOGS - 1);
    }
  };

  export const getLogs = async (): Promise<string[]> => {
    // Retrieve the last MAX_LOGS entries from the logs list from new to old
    const logs = await redis.lrange("logs", -MAX_LOGS, -1);
    // Reverse the order to return from old to new
    return logs.reverse();
  };
}
