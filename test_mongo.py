from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

mongodb_url = os.getenv("MONGODB_URL")

if not mongodb_url:
    print("Error: MONGODB_URL not found in .env")
else:
    try:
        client = MongoClient(mongodb_url)
        # The ismaster command is cheap and does not require auth.
        client.admin.command('ismaster')
        print("MongoDB Connection: OK")
    except Exception as e:
        print(f"MongoDB Connection: FAILED - {e}")
