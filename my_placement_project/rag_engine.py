import time
import os
import uuid
import sys
import streamlit as st
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader

# Try to import endee, but handle gracefully if not available
try:
    import endee
    ENDEE_AVAILABLE = True
except ImportError:
    ENDEE_AVAILABLE = False
    endee = None

# Initialize global models
@st.cache_resource
def load_embedding_model():
    return SentenceTransformer("all-MiniLM-L6-v2")

embedding_model = load_embedding_model()

# Lazy initialization of Endee client (don't block on import)
_client = None
_client_init_attempted = False

@st.cache_resource
def get_endee_client():
    """Lazily initialize Endee client on first use"""
    global _client, _client_init_attempted, ENDEE_AVAILABLE
    
    if _client_init_attempted:
        return _client
        
    _client_init_attempted = True
    
    if not ENDEE_AVAILABLE:
        return None
        
    try:
        _client = endee.Endee()
        return _client
    except Exception as e:
        ENDEE_AVAILABLE = False
        return None

def get_client():
    """Get the Endee client, initializing if needed"""
    return get_endee_client()

# Don't initialize client at import time - do it lazily
client = None

INDEX_NAME = "endee_rag_index"
DIMENSION = 384 # Dimension for all-MiniLM-L6-v2

_endee_vdb = None
_vdb_init_attempted = False

def init_endee_db():
    """Lazily initialize Endee VDB on first use"""
    global _endee_vdb, _vdb_init_attempted, ENDEE_AVAILABLE
    
    if _vdb_init_attempted:
        return _endee_vdb
        
    _vdb_init_attempted = True
    
    c = get_client()
    if not ENDEE_AVAILABLE or c is None:
        return None
        
    try:
        indexes = c.list_indexes()
        
        # Check if index exists
        index_exists = False
        try:
            _endee_vdb = c.get_index(INDEX_NAME)
            index_exists = True
        except:
            pass
            
        if not index_exists:
            try:
                c.create_index(INDEX_NAME, dimension=DIMENSION, space_type="cosine")
                _endee_vdb = c.get_index(INDEX_NAME)
                print(f"Index {INDEX_NAME} created.")
            except Exception as e:
                print("Index creation failed or already exists:", e)
                _endee_vdb = None
                
        return _endee_vdb
    except Exception as e:
        print(f"Error initializing VDB: {e}")
        ENDEE_AVAILABLE = False
        return None

def get_vdb():
    """Get the Endee VDB, initializing if needed"""
    return init_endee_db()

# Removed early initialization - will be lazy

def process_and_upsert_pdf(uploaded_file):
    start_time = time.time()
    vdb = get_vdb()
    if vdb is None:
        return 0, 0
        
    reader = PdfReader(uploaded_file)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
            
    # Text splitting
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_text(text)
    
    if not chunks:
        return 0, 0
        
    # Generate Embeddings
    embeddings = embedding_model.encode(chunks).tolist()
    
    # Prepare Upsert Payload
    input_array = []
    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        input_array.append({
            "id": f"chunk_{uuid.uuid4()}",
            "vector": emb,
            "meta": {
                "text": chunk,
                "source": uploaded_file.name
            }
        })
        
    # Upsert to Endee Vector Database
    # Process in batches of 100 just in case to respect MAX_VECTORS_PER_BATCH if defined softly
    for i in range(0, len(input_array), 100):
        vdb.upsert(input_array[i:i+100])
        
    end_time = time.time()
    return len(chunks), round(end_time - start_time, 2)

def query_endee(query_text, top_k=3):
    start_time = time.time()
    vdb = get_vdb()
    if vdb is None:
        return [], 0
        
    # 1. Embed query
    query_vector = embedding_model.encode(query_text).tolist()
    
    # 2. Search in Endee VDB
    # `query()` returns a list of dictionaries as seen in `ndd_api.py`
    results = vdb.query(vector=query_vector, top_k=top_k)
    
    end_time = time.time()
    search_time = round((end_time - start_time) * 1000, 2) # in ms
    
    # 3. Extract text from results
    context_chunks = []
    for res in results:
        # Based on ndd_api: res contains dict with 'meta' -> 'text'
        if 'meta' in res and 'text' in res['meta']:
            context_chunks.append(res['meta']['text'])
            
    return context_chunks, search_time

def generate_answer(query, context_chunks):
    # Retrieve-only generation (can be extended with LangChain + LLM like Groq if API key provided)
    if not context_chunks:
        return "I couldn't find any relevant information in the uploaded document."
        
    # Simulate an LLM for the local demo without API keys
    answer = "Based on the retrieved documents, here is the relevant information:\n\n"
    for i, chunk in enumerate(context_chunks):
        answer += f"**Excerpt {i+1}:** {chunk.strip()}\n\n"
        
    return answer
