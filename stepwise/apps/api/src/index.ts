import Fastify from "fastify";

const app = Fastify();

app.get("/health", async () => {
  return { status: "ok" };
});

app.listen({ port: 4000 }, () => {
  console.log("API running on http://localhost:4000");
});
