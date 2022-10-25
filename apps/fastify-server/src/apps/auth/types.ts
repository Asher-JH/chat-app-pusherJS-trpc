import { z } from "zod";
import { loginInputSchema, refreshTokenInputSchema } from "./schemas";

export type loginInput = z.infer<typeof loginInputSchema>;
export type refreshTokenInput = z.infer<typeof refreshTokenInputSchema>;
