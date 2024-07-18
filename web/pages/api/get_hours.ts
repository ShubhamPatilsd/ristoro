// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { auth, currentUser, getAuth } from "@clerk/nextjs/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { lat, lon, name } = JSON.parse(req.body);
  const businessName = name;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    businessName
  )}&location=${lat},${lon}&radius=1000&key=${apiKey}`;

  let firstRes = await fetch(textSearchUrl);
  firstRes = await firstRes.json();

  if (firstRes.results && firstRes.results.length > 0) {
    const placeId = firstRes.results[0].place_id;
    getPlaceDetails(placeId);
  } else {
    console.log("No results found.");
  }

  function getPlaceDetails(placeId) {
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,opening_hours&key=${apiKey}`;

    fetch(placeDetailsUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          console.log("Business Name:", data.result.name);
          res.json(data.result.opening_hours);
        } else {
          console.log("No details found.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        res.status(500).send(error);
      });
  }
}
