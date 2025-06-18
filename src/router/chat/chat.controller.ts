import { Router } from "express";
import { VectorStore } from "../../store";

export namespace ChatController {
  export const router = Router();

  router.post("/", async (req, res) => {
    const text = String(req.body.text || "");
    if (!text) {
      res.status(400).json({
        success: false,
        error: {
          code: "missing_query_parameter",
        },
        message: "Query parameter is required",
      });
      return;
    }

    const rs = await VectorStore.instance.query(text);
    console.log("Query result:", rs);
    res.status(200).json({
      success: true,
      data: rs?.documents || [],
    });
  });
}
