import requests
import json

url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={"37.80808591498051"},{"-122.43096616482535"}&radius={1600}&keyword=food&key={"AIzaSyDlmaAveRCszlZE2j5XiYVDeZafoQxWC0o"}"
response = requests.get(url)
data = json.loads(response.text)

# Write data to a file
with open('output.json', 'w') as file:
    json.dump(data, file, indent=4)

print("Data written to output.json")