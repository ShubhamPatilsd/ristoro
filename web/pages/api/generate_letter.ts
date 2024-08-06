// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";

import { auth, currentUser, getAuth } from "@clerk/nextjs/server";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt } = JSON.parse(req.body);

  const user = getAuth(req);

  console.log(prompt);

  // reverseLocation = reverseLocation.json();

  // gpt-3.5-turbo-0125
  // const model = new ChatAnthropic({ model: "claude-3-5-sonnet-20240620" });
  const model = new ChatGroq({ model: "llama-3.1-70b-versatile" });
  const promptTemplate = new PromptTemplate({
    template: `You are a restaurant searching assistant. Please use the given information to write a letter to the person provided. The restaurant is already selected and details will be given. These are all within SF. When responding, don't be overly excited or preppy. just be nonchalant. no exclamation marks. Feel free to use new line characters. Use ALL provided information in your response. If the restaurant is closed, note that but please don't stop yourself from ending the conversation there.
      
      PLEASE respond in HTML and ONLY in HTML. You have to use ALL information given to you. I give you full permission to use hyperlinks (always use <a href="" target="_blank">) and any sort of images. Bold anything that's important with the <strong> tag. Use HTML and html only in your response. Also include images. You must abide by all these instructions when formatting your response. Weave details into your speech as if you were writing a letter to the user. Do NOT start the letter with any form of salutation. Do remember to include things like the address in your response, or everything that would be helpful in getting that person/helping them make a choice. Make sure to bold closing and opening times. Bold if its open now or not. Bold important tips the user should know. Underline links with the <u></u> tag. Don't include seconds in the time. Only include timings for today if you chose to. Don't really give bad things, only positive things about the restaurant. Don't sound like AI made this response. Don't include Google Maps links in your response or any links that have not been given to you. Don't include any images in your response.

      Also, don't sign off. ${prompt}.  `,
    inputVariables: ["question"],
  });

  //@ts-ignore
  const chain = promptTemplate.pipe(model);

  const response = await chain.invoke({
    question: prompt,
    // document_data: JSON.stringify(result.docs),
  });

  res.json({ status: "Success", info: response.content });
}
