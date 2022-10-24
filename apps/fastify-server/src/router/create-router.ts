import { Context } from "./context";
import { router, TRPCError } from "@trpc/server";

type Meta = {
  authOnly?: boolean;
  allowedRole?: "admin" | "staff"; // Can do extra checking
};

export const createRouter = () => {
  return router<Context, Meta>().middleware(async ({ meta, next, ctx }) => {
    if (meta?.authOnly && !ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  });
};

export const createProtectedRouter = () => {
  return router<Context, Meta>().middleware(async ({ meta, next, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  });
};
