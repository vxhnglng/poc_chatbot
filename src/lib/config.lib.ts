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
      scrape: {
        interval: process.env.SCRAPE_INTERVAL || "",
      },
    };
  };
}
