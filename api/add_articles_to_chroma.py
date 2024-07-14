import csv
import chromadb
import json
chroma_client = chromadb.PersistentClient(path='./chromadb/collections')

collection = chroma_client.get_or_create_collection(name="food_collection")


idCount = 0
with open("scraped_articles_refined_new.csv", mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:

            collection.add(documents=[json.dumps({"text": row["text"], "source":row["source"]})], ids=[str(idCount)],metadatas={"text":row['text'], "source":row["source"]})            
            idCount+=1
            print(""+str(idCount)+"/716 done")
        

print("Finished")


