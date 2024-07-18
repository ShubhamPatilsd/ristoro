// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

import { auth, currentUser, getAuth } from "@clerk/nextjs/server";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, location, restaurantsNotFound } = JSON.parse(req.body);

  const user = getAuth(req);

  // const visited = await db.restaurant.findMany({
  //   where: {
  //     userId: user?.userId || "",
  //   },
  // });

  // const visitedNames = visited.map((restaurant) => restaurant.name);

  let result = await fetch(`${process.env.API_URL}/get_docs`, {
    method: "POST",
    body: JSON.stringify({ query: query }),
  });
  result = await result.json();

  const reverseLocation = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}`
  );

  if (user.userId) {
    const reverseLocationJSON = await reverseLocation.json();

    // reverseLocation = reverseLocation.json();

    const model = new ChatOpenAI({ model: "gpt-3.5-turbo-0125" });
    const promptTemplate = new PromptTemplate({
      template: `You are a restaurant recommendation searcher. Based on the input, look at the docs found to make an accurate suggestion. Please parse for places ONLY in San Francisco. Use only what is provided in the documents, don't come up with anything on on your own. Include the address too. Blue Bottle Coffee sucks.  Respond in JSON format with the 
       dont give any chains
      "
        name:"...",
        address:"...",
        description:"..."
      "

      Give only one good recommendation that is RELEVANT to the search query.

      Do not recommend these restaurants: ${restaurantsNotFound} 

      just give an array called "restaurants" with all this stuff please. Also, please respond with a custom made letter for the user with the different features of the place that you chose for them. This will be the "letter" field in your response.
      
      the user wants ${query} and ONLY ${query} in san francisco. Places: ${
        //@ts-ignore
        result.docs.text
      }

      When giving a response, consider if it would have ${query} at its location. Una Pizza Napoletana is closed permanently.
      
      \`\`\`json
      `,
      inputVariables: ["question"],
    });

    const chain = promptTemplate.pipe(model);

    const response = await chain.invoke({
      question: query,
      // document_data: JSON.stringify(result.docs),
    });

    res.json({ status: "Success", info: response.content });
  } else {
    res.status(403).send("Unauthed");
  }
}
