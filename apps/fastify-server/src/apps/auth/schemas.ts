import { z } from "zod";

export const loginInputSchema = z.object({
  username: z.string(),
});

export const refreshTokenInputSchema = z.object({
  token: z.string(),
});
