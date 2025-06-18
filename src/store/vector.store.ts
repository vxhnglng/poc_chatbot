import { ChromaClient, Collection } from "chromadb";
import { GoogleGenAI, Part } from "@google/genai";
import { IVectorStoreInput } from "../interface";
import { Config } from "../config";

export class VectorStore {
  private static _instance: VectorStore;
  private readonly embeddingModel = "models/embedding-001";
  private readonly collectionName = "articles";
  private readonly chromaClient = new ChromaClient(Config.get().chromadb);
  private genAI!: GoogleGenAI;
  private collection!: Collection;

  private constructor() {}

  static get instance(): VectorStore {
    if (!VectorStore._instance) {
      VectorStore._instance = new VectorStore();
    }
    return VectorStore._instance;
  }

  async init(apiKey: string): Promise<boolean> {
    try {
      this.genAI = new GoogleGenAI({ apiKey });
      this.collection = await this.chromaClient.getOrCreateCollection({
        name: this.collectionName,
        embeddingFunction: {
          generate: async (texts: string[]) => {
            const parts: Part[] = texts.map((text) => ({ text }));
            const result = await this.genAI.models.embedContent({
              contents: parts,
              model: this.embeddingModel,
            });

            if (result.embeddings) {
              return Array.from(result.embeddings.values()).map(
                (embedding) => embedding.values || []
              );
            }

            return [];
          },
        },
      });

      return true;
    } catch (error) {
      console.error("Error initializing ChromaDB collection:", error);
    }

    return false;
  }

  async embedAndStore(inputs: IVectorStoreInput[]): Promise<boolean> {
    try {
      if (!this.collection) {
        throw new Error("Collection is not initialized. Call init() first.");
      }

      const documents = inputs.map((input) => input.content);
      const ids = inputs.map((input) => input.id);
      const metadatas = inputs.map((input) => ({ source: input.id }));

      await this.collection.add({
        documents: documents,
        metadatas: metadatas,
        ids: ids,
      });

      return true;
    } catch (error) {
      console.error("Error embedding and storing content:", error);
    }

    return false;
  }

  async query(query: string) {
    try {
      if (!this.collection) {
        throw new Error("Collection is not initialized. Call init() first.");
      }

      const result = await this.collection.query({
        queryTexts: [
          [
            `---- system instructions ----`,
            `You are OptiBot, the customer-support bot for OptiSigns.com.`,
            `Tone: helpful, factual, concise.`,
            `Only answer using the uploaded docs.`,
            `Max 5 bullet points; else link to the doc.`,
            `Cite up to 3 "Article URL:" lines per reply.`,
            `---- customer query below ----`,
            query,
          ].join("\n"),
        ],
        nResults: 1,
      });

      return result;
    } catch (error) {
      console.error("Error embedding and storing content:", error);
    }

    return;
  }
}
