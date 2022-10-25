import { prisma } from "../../utils/prisma";
import { createRouter } from "../../utils/trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { loginInputSchema, refreshTokenInputSchema } from "./schemas";
import { loginResolver } from "./resolvers";

export const authRouter = createRouter()
  .mutation("login", {
    input: loginInputSchema,
    resolve: loginResolver,
  })
  .mutation("refresh-token", {
    input: refreshTokenInputSchema,
    resolve: async ({ input }) => {

    },
  });
