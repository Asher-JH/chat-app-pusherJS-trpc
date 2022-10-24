import { prisma } from "./prisma";
import { appRouter } from "./router";
import { createContext } from "./router/context";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";

export type AppRouter = typeof appRouter;

const server = fastify({
  maxParamLength: 5000,
});

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

server.register(cors, {
  origin: true,
});

(async () => {
  try {
    await server.listen({ port: 5000 });
    console.log("Server started 🚀");
    await prisma.$disconnect();
  } catch (err) {
    server.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
