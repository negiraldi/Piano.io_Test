import pandas as pd
import requests

# Step 1: Merge file A and file B while creating file C
df_a = pd.read_csv('fileA.csv')
df_b = pd.read_csv('fileB.csv')
df_c = pd.merge(df_a, df_b, on='user_id', how='inner')

# Step 2: Query the system API to check if users exist and replace user IDs with the ones from the API
api_url = "https://sandbox.piano.io/api/v3/publisher/user/list"
aid = "o1sRRZSLlw"
api_token = "xeYjNEhmutkgkqCZyhBn6DErVntAKDx30FqFOS6D"

def check_user_exists(email):
    api_params = {
        "aid": aid,
        "offset": 0,
        "api_token": api_token,
        "q": email
    }

    response = requests.get(api_url, params=api_params)
    if response.status_code == 200 :
        api_response = response.json()
        if api_response['count'] > 0 :
            return api_response['users'][0]['uid']
    return None

# Step 3: Replace user IDs with system API IDs in file C
for index, row in df_c.iterrows():
    email = row['email']
    uid = check_user_exists(email)
    if uid:
        df_c.at[index, 'user_id'] = uid

# Save file C as a CSV file

df_c.to_csv('fileC.csv', index=False)