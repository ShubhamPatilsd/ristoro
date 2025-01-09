// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { auth, currentUser, getAuth } from "@clerk/nextjs/server";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { urls } = req.body;
  const docs = await axios(
    `https://ael6waesqg.execute-api.us-east-1.amazonaws.com/v1/batch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        urls,
      },
    }
  );
  console.log(docs.data);

  res.json(docs.data);
}
