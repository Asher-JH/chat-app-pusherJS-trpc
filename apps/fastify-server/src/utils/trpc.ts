import { inferAsyncReturnType, TRPCError, router } from "@trpc/server";
import { type CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import jwt from "jsonwebtoken";

// Context
export async function createContext({ req, res }: CreateFastifyContextOptions) {
  async function getUser() {
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    let payload = null;

    if (token) {
      try {
        const data = jwt.verify(token, "super-secret");
        payload = data as { id: string; username: string };
      } catch (err) {}
    }

    return payload;
  }

  const user = await getUser();

  return { req, res, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;

type Meta = {
  authOnly?: boolean;
  allowedRole?: "admin" | "staff"; // Can do extra checking
};

export const createRouter = () => {
  return router<Context, Meta>().middleware(async ({ meta, next, ctx }) => {
    if (meta?.authOnly && !ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
    }
    return next();
  });
};

export const createProtectedRouter = () => {
  return router<Context, Meta>().middleware(async ({ next, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });
    }

    return next({
      // This makes `ctx.user` not-null for any following procedures
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });
};
