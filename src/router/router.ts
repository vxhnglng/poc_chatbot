import { Router } from "express";
import { ChatController } from "./chat";

export const router = Router();

router.use("/chat", ChatController.router);
