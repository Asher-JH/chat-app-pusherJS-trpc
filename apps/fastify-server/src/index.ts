import { prisma } from "./utils/prisma";
import { appRouter } from "./routers";
import { createContext } from "./utils/trpc";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";

export type AppRouter = typeof appRouter;

const server = fastify({
  maxParamLength: 5000,
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
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
    console.log("🚀 Server started");
    await prisma.$disconnect();
  } catch (err) {
    server.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
