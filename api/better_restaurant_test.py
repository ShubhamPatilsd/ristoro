import requests
import json
import time
from pathlib import Path

# Function to get Yelp data
def get_yelp_restaurants(api_key, location, offset=0, limit=50):
    url = 'https://api.yelp.com/v3/businesses/search'
    headers = {'Authorization': f'Bearer {api_key}'}
    params = {
        'location': location,
        'term': 'restaurants',
        'offset': offset,
        'limit': limit
    }
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

# Function to fetch data for a specific neighborhood
def fetch_yelp_data_for_neighborhood(api_key, neighborhood):
    all_data = []
    offset = 0
    limit = 50
    while True:
        try:
            data = get_yelp_restaurants(api_key, neighborhood, offset, limit)
            if not data['businesses']:
                break
            all_data.extend(data['businesses'])
            offset += limit
            if offset + limit > 240:
                break
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            break
        time.sleep(1)  # Respect Yelp's rate limiting
    return all_data

# Function to get Google Places data
def get_google_places(api_key, location, pagetoken=None):
    url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    params = {
        'query': f'restaurants in {location}',
        'key': api_key
    }
    if pagetoken:
        params['pagetoken'] = pagetoken
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

# Function to fetch Google Places data
def fetch_google_places_data(api_key, location):
    all_data = []
    pagetoken = None
    while True:
        data = get_google_places(api_key, location, pagetoken)
        all_data.extend(data['results'])
        pagetoken = data.get('next_page_token')
        if not pagetoken:
            break
        time.sleep(2)  # Respect Google's rate limiting
    return all_data

def save_to_json(data, filename):
    # Ensure the directory exists
    Path(filename).parent.mkdir(parents=True, exist_ok=True)
    
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)
# Main script to fetch data from Yelp and Google Places
yelp_api_key = 'klepuW9vGZYmBDtXoRwM8qnkAnskEvqwMu-d5Xr8qTIeIk5SEM1VJ8Yah-fBKkkHSqdhv_5Z42rELDiM1oO34b8HqxvalL6OugMB789EwC8dKVVjeLlyH8wTWBiWZnYx'
google_api_key='AIzaSyAuuCDXl6D21VMQG9VeXUP7AHv39b6TLGY'
neighborhoods = [
    "Alamo Square, San Francisco, CA",
    "Anza Vista, San Francisco, CA",
    "Ashbury Heights, San Francisco, CA",
    "Balboa Hollow, San Francisco, CA",
    "Balboa Terrace, San Francisco, CA",
    "The Bayview, San Francisco, CA",
    "Belden Place, San Francisco, CA",
    "Bernal Heights, San Francisco, CA",
    "Buena Vista, San Francisco, CA",
    "Butchertown, San Francisco, CA",
    "The Castro, San Francisco, CA",
    "Cathedral Hill, San Francisco, CA",
    "China Basin, San Francisco, CA",
    "Chinatown, San Francisco, CA",
    "Civic Center, San Francisco, CA",
    "Clarendon Heights, San Francisco, CA",
    "Cole Valley, San Francisco, CA",
    "Corona Heights, San Francisco, CA",
    "Cow Hollow, San Francisco, CA",
    "Crocker-Amazon, San Francisco, CA",
    "Design District, San Francisco, CA",
    "Diamond Heights, San Francisco, CA",
    "Dogpatch, San Francisco, CA",
    "Dolores Heights, San Francisco, CA",
    "Duboce Triangle, San Francisco, CA",
    "The Embarcadero, San Francisco, CA",
    "Eureka Valley, San Francisco, CA",
    "The Excelsior, San Francisco, CA",
    "The Fillmore, San Francisco, CA",
    "The Financial District, San Francisco, CA",
    "The Financial District South, San Francisco, CA",
    "Fisherman's Wharf, San Francisco, CA",
    "Forest Hill, San Francisco, CA",
    "Forest Knolls, San Francisco, CA",
    "Glen Park, San Francisco, CA",
    "Golden Gate Heights, San Francisco, CA",
    "The Haight, San Francisco, CA",
    "Hayes Valley, San Francisco, CA",
    "Hunters Point, San Francisco, CA",
    "India Basin, San Francisco, CA",
    "Ingleside, San Francisco, CA",
    "Ingleside Terraces, San Francisco, CA",
    "The Inner Sunset, San Francisco, CA",
    "Irish Hill, San Francisco, CA",
    "Islais Creek, San Francisco, CA",
    "Jackson Square, San Francisco, CA",
    "Japantown, San Francisco, CA",
    "Jordan Park, San Francisco, CA",
    "Laguna Honda, San Francisco, CA",
    "Lake Street, San Francisco, CA",
    "Lakeside, San Francisco, CA",
    "Lakeshore, San Francisco, CA",
    "Laurel Heights, San Francisco, CA",
    "Lincoln Manor, San Francisco, CA",
    "Little Hollywood, San Francisco, CA",
    "Little Russia, San Francisco, CA",
    "Little Saigon, San Francisco, CA",
    "Lone Mountain, San Francisco, CA",
    "The Lower Haight, San Francisco, CA",
    "Lower Pacific Heights, San Francisco, CA",
    "Lower Nob Hill, San Francisco, CA",
    "The Marina, San Francisco, CA",
    "Merced Heights, San Francisco, CA",
    "Merced Manor, San Francisco, CA",
    "Midtown Terrace, San Francisco, CA",
    "Mid-Market, San Francisco, CA",
    "Miraloma Park, San Francisco, CA",
    "Mission Bay, San Francisco, CA",
    "The Mission, San Francisco, CA",
    "Mission Dolores, San Francisco, CA",
    "Mission Terrace, San Francisco, CA",
    "Monterey Heights, San Francisco, CA",
    "Mount Davidson, San Francisco, CA",
    "Nob Hill, San Francisco, CA",
    "Noe Valley, San Francisco, CA",
    "North Beach, San Francisco, CA",
    "Oceanview, San Francisco, CA",
    "The Outer Mission, San Francisco, CA",
    "The Outer Sunset, San Francisco, CA",
    "Pacific Heights, San Francisco, CA",
    "Parkmerced, San Francisco, CA",
    "The Parkside, San Francisco, CA",
    "Parnassus, San Francisco, CA",
    "Polk Gulch, San Francisco, CA",
    "Portola, San Francisco, CA",
    "Portola Place, San Francisco, CA",
    "Potrero Hill, San Francisco, CA",
    "The Presidio, San Francisco, CA",
    "Presidio Heights, San Francisco, CA",
    "The Richmond, San Francisco, CA",
    "Rincon Hill, San Francisco, CA",
    "Russian Hill, San Francisco, CA",
    "Saint Francis Wood, San Francisco, CA",
    "Sea Cliff, San Francisco, CA",
    "Sherwood Forest, San Francisco, CA",
    "Silver Terrace, San Francisco, CA",
    "South Beach, San Francisco, CA",
    "South End, San Francisco, CA",
    "South of Market, San Francisco, CA",
    "South Park, San Francisco, CA",
    "Sunnydale, San Francisco, CA",
    "Sunnyside, San Francisco, CA",
    "The Sunset, San Francisco, CA",
    "Telegraph Hill, San Francisco, CA",
    "The Tenderloin, San Francisco, CA",
    "Treasure Island, San Francisco, CA",
    "Twin Peaks, San Francisco, CA",
    "Union Square, San Francisco, CA",
    "University Mound, San Francisco, CA",
    "Upper Market, San Francisco, CA",
    "Visitacion Valley, San Francisco, CA",
    "Vista del Mar, San Francisco, CA",
    "West Portal, San Francisco, CA",
    "The Western Addition, San Francisco, CA",
    "Westwood Highlands, San Francisco, CA",
    "Westwood Park, San Francisco, CA",
    "Yerba Buena, San Francisco, CA"
]

# Combined data storage
combined_data = []

# Fetch Yelp data for each neighborhood
for neighborhood in neighborhoods:
    print(f"Fetching Yelp data for {neighborhood}")
    yelp_data = fetch_yelp_data_for_neighborhood(yelp_api_key, neighborhood)
    for restaurant in yelp_data:
        restaurant['source'] = 'Yelp'
    combined_data.extend(yelp_data)

# Fetch Google Places data for each neighborhood
for neighborhood in neighborhoods:
    print(f"Fetching Google Places data for {neighborhood}")
    google_data = fetch_google_places_data(google_api_key, neighborhood)
    for restaurant in google_data:
        restaurant['source'] = 'Google'
    combined_data.extend(google_data)

# Save combined data to a JSON file
save_to_json(combined_data, 'data/restaurants_sf.json')

print("Data fetching and saving complete.")




