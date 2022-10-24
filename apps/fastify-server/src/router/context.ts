import { inferAsyncReturnType, TRPCError } from "@trpc/server";
import { type CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import jwt from "jsonwebtoken";

// Context
export async function createContext({ req, res }: CreateFastifyContextOptions) {
  async function getUser() {
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    if (token) {
      const payload = jwt.verify(token, "super-secret");
      return payload as { id: string; username: string };
    }

    return null;
  }

  const user = await getUser();

  return { req, res, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;
