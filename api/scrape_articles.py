import re
from bs4 import BeautifulSoup, Comment
from lxml import etree

import requests
import xml.etree.ElementTree as ET
import newspaper
import pandas as pd
import get_all_urls

xml_dict = []

xml_data = requests.get("https://sf.eater.com/sitemaps").text

# print(f"The number of sitemap tags are {len(root)}")

namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
root = ET.fromstring(xml_data)

final_df = pd.DataFrame()

# Extract all sitemap URLs
sitemap_urls = [sitemap.find('ns:loc', namespace).text for sitemap in root.findall('ns:sitemap', namespace)]
# all_url_data = []


# # Print the extracted URLs
# for url in sitemap_urls:
#     xml_content = requests.get(url).text
#     sitemap_data = ET.fromstring(xml_content)

#     # Namespace dictionary to handle the default namespace
#     namespaces = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

#     # Extract URLs and lastmod dates

#     for url in sitemap_data.findall('ns:url', namespaces):
#         loc = url.find('ns:loc', namespaces).text

#         if("https://sf.eater.com/maps" in loc):
#             all_url_data.append(loc)
#             print(loc)
        
# file = open("maps_list.txt", "w") 
# file.write(str(all_url_data))
        

all_url_data = get_all_urls.get_url_list()

# class SingleSource(newspaper.Source):
#     def __init__(self, articleURL):
#         super(SingleSource, self).__init__("http://localhost")
#         self.articles = [newspaper.Article(url=articleURL)]

# sources = [SingleSource(articleURL=u) for u in all_url_data]

# print(len(sources))

# # news_pool.set(sources, threads_per_source=1)

# # news_pool.join()

# artcile = newspaper.article(all_url_data[100])
# artcile = newspaper.article("https://sf.eater.com/maps/best-afternoon-high-tea-san-francisco-bay-area")
# artcile.download()
# artcile.parse()
# artcile.nlp()

# soup = BeautifulSoup(artcile.html, "html.parser")

def tag_visible(element):
    
    
    if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
        return False
    
    
    if isinstance(element, Comment):
        return False
    return True


def text_from_html(body, source):
    soup = BeautifulSoup(body, 'html.parser')

     
   # Step 3: Identify and extract the elements containing the names and descriptions
    items = []
    
    # The assumption here is each coffee shop is within a <div> with class 'c-mapstack__card'
    # and within it, the name is within a <h1> or <h2> tag with class 'c-mapstack__card-hed'
    # and the description within a <div> with class 'c-entry-content'
    for card in soup.find_all('section', class_='c-mapstack__card'):
        if(card['data-slug']=='intro' or card['data-slug']=='related-links'):
            continue

        # Extract the name of the coffee shop
        name_tag = card.find('h1')
        if not name_tag:
            name_tag = card.find('h2')
        
        name = name_tag.get_text(strip=True).replace("\xa0", " ") if name_tag else 'No Name Found'
        
        # Extract the description of the coffee shop
        description_tag = card.find('div', class_='c-entry-content')
        description = description_tag.get_text(strip=True) if description_tag else 'No Description Found'

        address_tag = card.findAll('div',class_='c-mapstack__address')
        address = address_tag[0].get_text(strip=True) if len(address_tag)>0 else 'No Description Found'
        items.append({'name': name, 'description': description, 'address':address, 'source':source})

    # Print the list of coffee shops with their descriptions
    return items
    # texts = soup.findAll(text=True)
    # visible_texts = filter(tag_visible, texts)  
    # return u" ".join(t.strip() for t in visible_texts)








# uncomment this later
# for source in all_url_data:
count = 0
for source in all_url_data:
    # temporary lists to store each element we want to extract
    restaurants = []

    


    article_extract = newspaper.Article(source)
    try:
        article_extract.download()
        article_extract.parse()


    except:
        print("Article download failed")

    

    # Appending the elements we want to extract

    masterText = ""

    itemsFound = text_from_html(article_extract.html, article_extract.canonical_link)
    i=1
    for item in itemsFound:
        restaurants.append(item)

        masterText+="Ranking: "+str(i)+". Name: "+item['name']+". Description: "+item['description']+". Address: "+item['address']+"\n"
        # temp_df = pd.DataFrame({'name': [item['name']], 'description': [item['description']], 'address': [item['address']], 'source': [item['source']]})
        
        i+=1


    temp_df = pd.DataFrame({'text':masterText, 'source': [article_extract.canonical_link]})
        # Append to the final DataFrame
    final_df = final_df._append(temp_df, ignore_index = True)


    

    # Update count
    count +=1

    print(str(count)+"/"+str(len(all_url_data))+" articles parsed.")




    
    
# From here you can export this to csv file
final_df.to_csv('scraped_articles_refined_new.csv')






#  url_data.append((loc))
#         each_article = Article(loc)

#         each_article.download()
#         each_article.parse()
#         each_article.nlp()
        
#         temp_df = pd.DataFrame(columns = ['Title', 'Authors', 'Text',
#                                             'Summary', 'published_date', 'Source'])
        
#         temp_df['Authors'] = each_article.authors
#         temp_df['Title'] = each_article.title
#         temp_df['Text'] = each_article.text
#         temp_df['Summary'] = each_article.summary
#         temp_df['published_date'] = each_article.publish_date
#         temp_df['Source'] = each_article.source_url
        
#         final_df = final_df._append(temp_df, ignore_index = True)