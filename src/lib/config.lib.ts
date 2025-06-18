export namespace ConfigLib {
  export const get = () => {
    return {
      app: {
        port: Number(process.env.PORT) || 3000,
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
        url: String(process.env.CHROMADB_URL),
      },
    };
  };
}
