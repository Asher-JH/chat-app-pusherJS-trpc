import { createRouter } from "./create-router";
import { authRouter } from "./routers/auth";
import { groupsRouter } from "./routers/groups";
import { messagesRouter } from "./routers/messages";

export const appRouter = createRouter()
  .merge("auth.", authRouter)
  .merge("groups.", groupsRouter)
  .merge("messages.", messagesRouter);
