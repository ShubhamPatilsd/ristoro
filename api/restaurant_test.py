import requests

# def get_yelp_restaurants(api_key, location, term='cafe', sort_by='rating'):
#     url = 'https://api.yelp.com/v3/businesses/search'
#     headers = {'Authorization': f'Bearer {api_key}'}
#     params = {
#         'location': location,
#         'sort_by': sort_by,
#         'limit': 50,
#         'offset':1000,
#     }
#     response = requests.get(url, headers=headers, params=params)
#     return response.json()

yelp_api_key = 'klepuW9vGZYmBDtXoRwM8qnkAnskEvqwMu-d5Xr8qTIeIk5SEM1VJ8Yah-fBKkkHSqdhv_5Z42rELDiM1oO34b8HqxvalL6OugMB789EwC8dKVVjeLlyH8wTWBiWZnYx'
google_api_key='AIzaSyAuuCDXl6D21VMQG9VeXUP7AHv39b6TLGY'
location = 'San Francisco, CA'
# data = get_yelp_restaurants(api_key, location)

# print(data)
# # Sample output
# for restaurant in data['businesses']:
#     print(restaurant['name'], restaurant['rating'], restaurant['review_count'])


def get_businesses(location, term, api_key):
    headers = {'Authorization': 'Bearer %s' % api_key}
    url = 'https://api.yelp.com/v3/businesses/search'

    data = []
    for offset in range(0, 1000, 50):
        params = {
            'limit': 50, 
            'location': location.replace(' ', '+'),
            'term': term.replace(' ', '+'),
            'offset': offset
        }

        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            data += response.json()['businesses']
            print("50 loaded")
            file = open("write.txt", "w")
            file.write(str(response.json()['businesses']))
            file.close()
        elif response.status_code == 400:
            print('400 Bad Request', response.json())
            break
        
    return data

get_businesses(location, 'food', api_key)