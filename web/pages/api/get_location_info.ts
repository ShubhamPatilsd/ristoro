// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { auth, currentUser, getAuth } from "@clerk/nextjs/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name } = JSON.parse(req.body);
  const businessName = name;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    businessName
  )} san francisco&key=${apiKey}`;

  let firstRes = await fetch(textSearchUrl);
  firstRes = await firstRes.json();

  //@ts-ignore

  //@ts-ignore
  res.json(firstRes.results);
}
