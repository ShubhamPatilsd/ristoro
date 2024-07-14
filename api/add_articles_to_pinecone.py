import csv
import os

from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
import dotenv

dotenv.load_dotenv()



model_name = "text-embedding-3-small"  
embeddings = OpenAIEmbeddings(  
    model=model_name,  
    openai_api_key=os.environ.get("OPENAI_API_KEY")  
)  
print(os.environ.get("PINECONE_API_KEY"))

pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))

index_name = "sanfranfoodarticle"

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536, 
        metric="cosine", 
        spec=ServerlessSpec(
            cloud="aws", 
            region="us-east-1"
        ) 
    ) 




namespace = "wondervector5000"


    
idCount = 0
with open("my_scraped_articles.csv", mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            print(row['Title'])

            docsearch = PineconeVectorStore.from_texts(
                texts=[row['Text']],
                metadatas=[{"title":row['Title'], "text":row["Text"], "source":row["Source"]}],
                index_name=index_name,
                embedding=embeddings, 
                namespace=namespace 
            )
            # collection.add(documents=[row['Text']], ids=[str(idCount)],metadatas={"title":row['Title'], "text":row["Text"]})            
            print("finished with article")
            idCount+=1

print("Finished")


