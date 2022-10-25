import { prisma } from "../utils/prisma";
import { pusher } from "../utils//pusher";
import { createProtectedRouter } from "../utils/trpc";
import { z } from "zod";

export const messagesRouter = createProtectedRouter()
  .query("getMessages", {
    input: z.object({
      groupId: z.string(),
    }),
    async resolve({ input }) {
      const messages = await prisma.message.findMany({
        where: {
          groupId: input.groupId,
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
  });
