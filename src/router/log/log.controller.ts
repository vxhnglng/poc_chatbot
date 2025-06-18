import { Router } from "express";
import { LoggerLib } from "../../lib/logger.lib";

export namespace LogController {
  export const router = Router();

  router.get("/", async (_, res) => {
    const logs = await LoggerLib.getLogs();
    res.status(200).json({
      success: true,
      data: logs,
    });
  });
}
