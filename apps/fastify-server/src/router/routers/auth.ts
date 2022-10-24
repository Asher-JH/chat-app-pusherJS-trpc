import { prisma } from "../../prisma";
import { createRouter } from "../create-router";
import { z } from "zod";

export const authRouter = createRouter()
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
  .mutation("sign-up", {
    input: z.object({
      username: z.string(),
      password: z.string(),
    }),
    resolve: async ({ input }) => {
      return {};
    },
  });
