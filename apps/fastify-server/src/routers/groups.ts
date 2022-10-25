import { prisma } from "../utils//prisma";
import { createProtectedRouter } from "../utils/trpc";
import { z } from "zod";

export const groupsRouter = createProtectedRouter()
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
