import { Router } from "express";
import { ChatController } from "./chat";
import { LogController } from "./log";

export const router = Router();

router.use("/chats", ChatController.router);
router.use("/logs", LogController.router);
