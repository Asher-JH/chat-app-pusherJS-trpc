import { Context } from "./context";
import { router } from "@trpc/server";

export const createRouter = () => {
  return router<Context>();
};
