try:
    from bson import ObjectId
    print("Successfully imported ObjectId from bson")
    print("Test ObjectId:", ObjectId())
except Exception as e:
    print(f"Error importing ObjectId: {e}")
    print(f"Error type: {type(e)}")

try:
    import pymongo
    print("\nPyMongo version:", pymongo.version)
    print("PyMongo has these modules:", dir(pymongo))
except Exception as e:
    print(f"Error importing pymongo: {e}") 