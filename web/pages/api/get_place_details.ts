// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { auth, currentUser, getAuth } from "@clerk/nextjs/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { lat, lon, name } = JSON.parse(req.body);
  const VERSION = "20231010";

  const SEARCH_API_URL = "https://api.foursquare.com/v3/places/search";
  const DETAILS_API_URL = "https://api.foursquare.com/v3/places/";

  const searchByCoords = async (name: string, lat: string, lon: string) => {
    const params = {
      ll: `${lat},${lon}`,
      query: name,
      limit: 1,
    };

    console.log(new URLSearchParams(params).toString());
    const response = await fetch(
      `${SEARCH_API_URL}?${new URLSearchParams(params).toString()}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: process.env.FOURSQUARE_API_KEY || "",
        },
      }
    );

    return response.json();
  };
  const getRestaurantDetails = async (venue_id: string) => {
    const params = {
      fields:
        "description,tel,website,hours,rating,price,menu,tips,photos,tastes,features",
    };
    const response = await fetch(
      `${DETAILS_API_URL}${venue_id}?${new URLSearchParams(params).toString()}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: process.env.FOURSQUARE_API_KEY || "",
        },
      }
    );
    return response.json();
  };

  const results = await searchByCoords(name, lat, lon);
  console.log(results);
  if (results.results) {
    const venueId = results.results[0].fsq_id;
    const details = await getRestaurantDetails(venueId);
    const venue = details;
    res.json(venue);
  } else {
    console.log("Venue not found");
  }
}
