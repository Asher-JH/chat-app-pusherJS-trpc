import { inferAsyncReturnType } from "@trpc/server";
import { type CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

// Context
export function createContext({ req, res }: CreateFastifyContextOptions) {
  const token = req.headers.authorization ?? "";

  // decode JWT
  // Fetch user

  const user = {};

  return { req, res, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;
