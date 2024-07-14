// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { db } from "@/util/prisma";
import { auth, currentUser, getAuth } from "@clerk/nextjs/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { restaurantName } = JSON.parse(req.body);

  const user = getAuth(req);

  if (user.userId) {
    const visited = await db.restaurant.create({
      data: {
        userId: user.userId,
        name: restaurantName,
      },
    });

    res.json({ status: "Success", info: visited });
  } else {
    res.status(403).send("Unauthed");
  }
}
