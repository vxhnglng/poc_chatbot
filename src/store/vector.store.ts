import { ChromaClient, Collection } from "chromadb";
import { GoogleGenAI, Part } from "@google/genai";
import { IVectorStoreInput } from "../interface";

export class VectorStore {
  private static _instance: VectorStore;
  private readonly embeddingModel = "models/embedding-001";
  private readonly collectionName = "articles";
  private readonly chromaClient = new ChromaClient({
    path: "./persist/chroma.db",
  });
  private genAI!: GoogleGenAI;
  private collection!: Collection;

  private constructor() {}

  get instance(): VectorStore {
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
      const parts: Part[] = documents.map((document) => ({ text: document }));
      const result = await this.genAI.models.embedContent({
        contents: parts,
        model: this.embeddingModel,
      });

      if (!result.embeddings) {
        throw new Error("No embeddings returned from the model.");
      }

      if (result.embeddings.length !== documents.length) {
        throw new Error(
          "Mismatch between number of documents and embeddings generated."
        );
      }

      await this.collection.add({
        documents: documents,
        embeddings: Array.from(result.embeddings.values()).map(
          (embedding) => embedding.values || []
        ),
        metadatas: metadatas,
        ids: ids,
      });

      return true;
    } catch (error) {
      console.error("Error embedding and storing content:", error);
    }

    return false;
  }
}
