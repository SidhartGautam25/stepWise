/**
 * API Entry Point — app factory and server bootstrap only.
 * All routes are in routes/index.ts.
 */

import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerRoutes } from "./routes/index";

export function createApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV === "development",
  });

  // Allow web dashboard (and any localhost origin in dev) to call the API
  app.register(cors, {
    origin: process.env.NODE_ENV === "production"
      ? ["https://stepwise.dev"] // restrict in prod
      : true,                    // allow all in dev
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  registerRoutes(app);

  return app;
}

if (require.main === module) {
  const app = createApp();

  app.listen({ host: "127.0.0.1", port: 4000 }, (error) => {
    if (error) throw error;
    console.log("✓ API running on http://127.0.0.1:4000");
  });
}
