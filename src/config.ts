export namespace Config {
  export const get = () => {
    return {
      app: {
        port: Number(process.env.APP_PORT) || 3000,
      },
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
          ? Number(process.env.REDIS_PORT)
          : undefined,
        password: process.env.REDIS_PASS,
      },
      gen_ai: {
        api_key: String(process.env.GEN_AI_API_KEY),
      },
      scrape: {
        interval: process.env.SCRAPE_INTERVAL || "",
      },
      chromadb: {
        host: String(process.env.CHROMADB_HOST),
        port: process.env.CHROMADB_PORT
          ? Number(process.env.CHROMADB_PORT)
          : undefined,
        ssl: process.env.CHROMADB_SSL === "true",
      },
    };
  };
}
