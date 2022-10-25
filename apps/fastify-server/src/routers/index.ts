import { createRouter } from "../utils/trpc";
import { authRouter } from "./auth";
import { groupsRouter } from "./groups";
import { messagesRouter } from "./messages";
import { userRouter } from "./users";

export const appRouter = createRouter()
  .merge("auth.", authRouter)
  .merge("groups.", groupsRouter)
  .merge("messages.", messagesRouter)
  .merge("users.", userRouter);
