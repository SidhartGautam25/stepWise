/**
 * Challenge Controller — HTTP layer for the challenge catalog.
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import { listChallenges, getChallengeInfo } from "../services/challengeService";

export async function listAllChallenges(_request: FastifyRequest, _reply: FastifyReply) {
  return { challenges: listChallenges() };
}

export async function getChallengeById(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id?: string };

  if (!id) {
    return reply.status(400).send({ error: "Challenge id is required" });
  }

  try {
    return getChallengeInfo(id);
  } catch (err) {
    return reply.status(404).send({
      error: err instanceof Error ? err.message : "Challenge not found",
    });
  }
}
