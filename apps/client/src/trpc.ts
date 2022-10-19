import { createReactQueryHooks } from "@trpc/react";
import { AppRouter } from "fastify-server";

export const trpc = createReactQueryHooks<AppRouter>();
