import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const response = await axios.get(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36",
        },
      }
    );

    const $ = cheerio.load(response.data);

    const links = [];
    $(".yuRUbf a").each((i, elem) => {
      links.push($(elem).attr("href"));
    });

    res.status(200).json({ links });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while scraping" });
  }
}
