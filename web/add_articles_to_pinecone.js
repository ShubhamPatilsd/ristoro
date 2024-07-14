import { Pinecone } from "@pinecone-database/pinecone";
import { EmbeddingModel, FlagEmbedding } from "fastembed";
import { readFileSync } from "fs";
import * as csv from "@fast-csv/parse";

const pc = new Pinecone({
  apiKey: "",
});

const embeddingModel = await FlagEmbedding.init({
  model: EmbeddingModel.AllMiniLML6V2,
});

const fileContent = readFileSync("./my_scraped_articles.csv");

await pc.createIndex({
  name: "quickstart",
  dimension: 8, // Replace with your model dimensions
  metric: "euclidean", // Replace with your model metric
  spec: {
    serverless: {
      cloud: "aws",
      region: "us-east-1",
    },
  },
});
