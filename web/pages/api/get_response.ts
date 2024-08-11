// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

import { auth, currentUser, getAuth } from "@clerk/nextjs/server";
import { ChatGroq } from "@langchain/groq";
import { NextRequest } from "next/server";
export const runtime = "edge";

export const dynamic = "force-dynamic"; // always run dynamically

type Data = {
  name: string;
};

export default async function handler(req: NextRequest, res: NextApiResponse) {
  const json = await req.json();

  const { query, location, restaurantsNotFound, result } = json;

  const user = getAuth(req);

  console.log(`Result is here: ${result ? true : false}`);

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      // Prevent anything else being added to the stream

      const model = new ChatGroq({ model: "llama-3.1-8b-instant" });
      const promptTemplate = new PromptTemplate({
        template: `You are a restaurant recommendation searcher. Based on the input, look at the docs found to make an accurate suggestion. Please parse for places ONLY in San Francisco. Use only what is provided in the documents, don't come up with anything on on your own. Include the address too. Blue Bottle Coffee sucks.  Respond in JSON format with the 
           dont give any chains
          "
          restaurants:[
            
          name:"...",
            address:"...",
            description:"..."]
          "
    
          wrap that with curly braces btw
    
          Give only one good recommendation that is RELEVANT to the search query.
    
          Do not recommend these restaurants: ${restaurantsNotFound} 
    
          just give an array called "restaurants" with all this stuff please. Give 10 restaurants please!
          
          the user wants ${query} and ONLY ${query} in san francisco. Places: ${
          //@ts-ignore
          result.docs.text
        }
    
          When giving a response, consider if it would have ${query} at its location. Una Pizza Napoletana is closed permanently. Start directyl with the JSON, no sentences before. Dont start or end with \`\`\`
          
    
          `,
        inputVariables: ["question"],
      });

      //@ts-ignore
      const chain = promptTemplate.pipe(model);

      const response = await chain.invoke({
        question: query,
        // document_data: JSON.stringify(result.docs),
      });

      console.log(response.content);

      const items = JSON.parse(response.content.toString()).restaurants;
      const item = items[Math.floor(Math.random() * items.length)];

      controller.enqueue(
        encoder.encode(JSON.stringify({ restaurants: [item] }))
      );

      controller.close();
    },
  });

  // const visited = await db.restaurant.findMany({
  //   where: {
  //     userId: user?.userId || "",
  //   },
  // });

  // const visitedNames = visited.map((restaurant) => restaurant.name);

  // reverseLocation = reverseLocation.json();

  // res.json({ status: "Success", info: response.content });
  return new Response(customReadable, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
