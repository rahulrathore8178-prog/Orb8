import chromadb

client = chromadb.CloudClient(
  api_key='ck-3JpuM4dG74PbN9uSojsHi6Z3KSsTM5TUTvvEEtxHVNeZ',
  tenant='f64e7b0c-b54b-4e58-9ccc-504b45decdea',
  database='Orb8'
)

collection = client.get_or_create_collection(name="Orb8")
posts_collection = client.get_or_create_collection(name="Orb8-posts-data")