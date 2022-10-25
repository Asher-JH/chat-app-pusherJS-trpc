import { createProtectedRouter } from "../utils/trpc";

export const userRouter = createProtectedRouter().query("me", {
  async resolve({ ctx }) {
    return ctx.user;
  },
});
