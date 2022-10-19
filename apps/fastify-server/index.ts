import * as trpc from "@trpc/server";
import { inferAsyncReturnType } from "@trpc/server";
import {
  type CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import { z } from "zod";
import fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";

import { pusher } from "./pusher";

const prisma = new PrismaClient();

// Context
function createContext({ req, res }: CreateFastifyContextOptions) {
  const user = { name: req.headers.username ?? "guest" };

  return { req, res, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;

// trpc - queries + mutations
export const appRouter = trpc
  .router()
  .query("getMessages", {
    input: z.string(),
    async resolve({ input }) {
      const messages = await prisma.message.findMany({
        where: {
          groupId: input,
        },
        include: {
          sender: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return messages.reverse();
    },
  })
  .mutation("login", {
    input: z.object({
      username: z.string(),
    }),
    async resolve({ input }) {
      const user = await prisma.user.findUnique({
        where: {
          username: input.username,
        },
      });

      if (!user) {
        await prisma.user.create({
          data: {
            username: input.username,
          },
        });
      }

      return user?.username || input.username;
    },
  })
  .mutation("addMessage", {
    input: z.object({
      username: z.string(),
      groupId: z.string(),
      message: z.string(),
    }),
    async resolve({ input }) {
      const message = await prisma.message.create({
        data: {
          content: input.message,
          group: {
            connect: {
              id: input.groupId,
            },
          },
          sender: {
            connect: {
              username: input.username,
            },
          },
        },
      });

      pusher.trigger(message.groupId, "new-message", message);

      return message;
    },
  })
  .query("getGroups", {
    async resolve() {
      const groups = await prisma.group.findMany({});

      return groups;
    },
  })
  .mutation("addGroup", {
    input: z.object({
      username: z.string(),
    }),
    async resolve({ input }) {
      const newGroup = await prisma.group.create({
        data: {
          createdBy: {
            connect: {
              username: input.username,
            },
          },
          users: {
            connect: {
              username: input.username,
            },
          },
        },
      });

      return newGroup;
    },
  })
  .mutation("joinGroup", {
    input: z.object({
      username: z.string(),
      groupdId: z.string(),
    }),
    async resolve({ input }) {
      await prisma.group.update({
        where: {
          id: input.groupdId,
        },
        data: {
          users: {
            connect: {
              username: input.username,
            },
          },
        },
      });
    },
  });

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
