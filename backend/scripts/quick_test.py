import requests
r = requests.get('http://localhost:8000/api/rankings/daily?limit=3&locale=ja')
print(f'Status: {r.status_code}')
if r.status_code == 200:
    data = r.json()
    print(f'Success! {len(data.get("rankings", []))} books')
    for item in data['rankings']:
        print(f"  {item['rank']}. {item['book']['title']}")
else:
    print(r.text[:300])

