    from supabase import create_client

    # Your Supabase project URL
    url = "https://fvfohlmwutqdcvvgpabi.supabase.co"

    # Your service role key OR anon key
    key = "sb_publishable_rz0QS4bXXlSClgE-DE7cEQ_3XffG3YS"

    # Create client
    supabase = create_client(url, key)

    # Insert data
    data = {
        "message": "hello sentinel"
    }

    insert_res = supabase.table("test").insert(data).execute()

    print("Inserted:")
    print(insert_res.data)

    # Read data
    select_res = supabase.table("test").select("*").execute()

    print("\nAll Rows:")
    print(select_res.data)