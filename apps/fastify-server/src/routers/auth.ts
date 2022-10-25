import { prisma } from "../utils//prisma";
import { createRouter } from "../utils/trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";

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
        select: {
          id: true,
          username: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      const accessToken = jwt.sign(user, "super-secret", { expiresIn: "45s" });
      const refreshToken = jwt.sign(user, "super-refresh", { expiresIn: "5m" });

      return { accessToken, refreshToken };
    },
  })
  .mutation("refresh-token", {
    input: z.object({
      token: z.string(),
    }),
    resolve: async ({ input, ctx }) => {
      return jwt.verify(input.token, "super-refresh", (err, user) => {
        if (err || !user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unable to verify token",
          });
        }

        const userData = user as { id: string; username: string };
        const accessToken = jwt.sign(
          { id: userData.id, username: userData.username },
          "super-secret",
          {
            expiresIn: "45s",
          }
        );
        return {
          accessToken,
        };
      });
    },
  });
