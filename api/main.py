import csv
import chromadb
from langchain_openai import OpenAI
from langchain_anthropic import ChatAnthropic

# from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains import LLMChain

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


load_dotenv()

app = FastAPI()

# embeddings = OpenAIEmbeddings()

chroma_client = chromadb.PersistentClient(path='./chromadb/collections')

collection = chroma_client.get_collection(name="food_collection")

@app.post("/get_docs")
async def create_item(request: Request):
    query = await request.json()
    query = query['query']

    print(query)

    results = collection.query(
        query_texts=[query], # Chroma will embed this for you
        n_results=4 # how many results to return
    )




    docs = []

    for item in results["metadatas"]:
        for item2 in item:
            docs.append(item2)
            print((item2['source']))

    print("done")

    return JSONResponse(content={"status":"success", "docs":docs})



# llm = ChatAnthropic(model="claude-3-opus-20240229")
# prompt = PromptTemplate(input_variables=["question","document_data"], template="You are a restaurant recommendation searcher. Based on the input, look at the docs found to make an accurate suggestion. There may be some spilled content from the scraping, only focus on the relevant information. Please look for restaurants ONLY in SF. Query: {question} Docs: {document_data}")


# chain = LLMChain(llm=llm, prompt=prompt)


# response = chain.run(question=query, document_data=results)


# print(response)