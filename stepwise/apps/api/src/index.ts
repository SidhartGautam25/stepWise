import Fastify from "fastify";
import {
  parseStartAttemptRequest,
  parseSubmitResultRequest,
} from "../../../packages/attempt-contracts/src";
import { startAttempt, submitResult } from "./attemptService";

export function createApp() {
  const app = Fastify();

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.post("/attempts/start", async (request, reply) => {
    try {
      const payload = parseStartAttemptRequest(request.body);
      return startAttempt(payload);
    } catch (error) {
      return reply.status(400).send({
        error: error instanceof Error ? error.message : "Invalid request",
      });
    }
  });

  app.post("/attempts/submit-result", async (request, reply) => {
    try {
      const payload = parseSubmitResultRequest(request.body);
      return submitResult(payload);
    } catch (error) {
      return reply.status(400).send({
        error: error instanceof Error ? error.message : "Invalid request",
      });
    }
  });

  return app;
}

if (require.main === module) {
  const app = createApp();

  app.listen({ port: 4000 }, (error) => {
    if (error) {
      throw error;
    }

    console.log("API running on http://localhost:4000");
  });
}
