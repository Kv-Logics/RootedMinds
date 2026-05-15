from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_KEY not found in .env")
else:
    # Create client
    supabase = create_client(url, key)

    # Insert data
    data = {
        "message": "hello sentinel from python script"
    }

    try:
        insert_res = supabase.table("test").insert(data).execute()
        print("Inserted:")
        print(insert_res.data)

        # Read data
        select_res = supabase.table("test").select("*").execute()
        print("\nAll Rows:")
        print(select_res.data)
    except Exception as e:
        print(f"Error: {e}")