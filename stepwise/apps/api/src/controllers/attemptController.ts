/**
 * Attempt Controller — HTTP layer for attempt lifecycle endpoints.
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import {
  parseStartAttemptRequest,
  parseSubmitResultRequest,
} from "../../../../packages/attempt-contracts/src";
import * as attemptService from "../services/attemptService";

export async function startAttempt(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = parseStartAttemptRequest(request.body);
    const result = await attemptService.startAttempt({
      ...payload,
      userId: request.userId!, // always from JWT, never from body
    });
    return result;
  } catch (err) {
    return reply.status(400).send({
      error: err instanceof Error ? err.message : "Invalid request",
    });
  }
}

export async function submitResult(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = parseSubmitResultRequest(request.body);
    const result = await attemptService.submitResult({
      ...payload,
      userId: request.userId!,
    });
    return result;
  } catch (err) {
    return reply.status(400).send({
      error: err instanceof Error ? err.message : "Invalid request",
    });
  }
}

export async function getDashboard(request: FastifyRequest, _reply: FastifyReply) {
  return attemptService.getUserDashboard(request.userId!);
}
