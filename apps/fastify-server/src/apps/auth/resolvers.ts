import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { prisma } from "../../utils/prisma";
import { loginInput, refreshTokenInput } from "./types";

export const loginResolver = async ({ input }: { input: loginInput }) => {
  const user = await prisma.user.findUnique({
    where: {
      username: input.username,
    },
    select: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const accessToken = jwt.sign(user, "super-secret", { expiresIn: "45s" });
  const refreshToken = jwt.sign(user, "super-refresh", { expiresIn: "5m" });

  return { accessToken, refreshToken };
};

export const refreshTokenResolver = async ({
  input,
}: {
  input: refreshTokenInput;
}) => {
  jwt.verify(input.token, "super-refresh", (err, user) => {
    if (err || !user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const accessToken = jwt.sign(user, "super-secret", {
      expiresIn: "45s",
    });
    return {
      accessToken,
    };
  });
};
