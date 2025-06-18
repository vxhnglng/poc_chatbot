export namespace Config {
  export const get = () => {
    return {
      app: {
        port: Number(process.env.APP_PORT),
      },
      redis: {
        host: String(process.env.REDIS_HOST),
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASS,
      },
      gen_ai: {
        api_key: String(process.env.GEN_AI_API_KEY),
        embedding_model: String(process.env.GEN_AI_EMBEDDING_MODEL),
      },
      scrape: {
        interval: String(process.env.SCRAPE_INTERVAL),
      },
      chromadb: {
        host: String(process.env.CHROMADB_HOST),
        port: Number(process.env.CHROMADB_PORT),
        ssl: String(process.env.CHROMADB_SSL) === "true",
        collection_name: String(process.env.CHROMADB_COLLECTION_NAME),
      },
    };
  };
}
