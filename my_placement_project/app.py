import streamlit as st
import time
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import rag_engine
    ENDEE_AVAILABLE = True
except ImportError as e:
    ENDEE_AVAILABLE = False
    rag_engine = None

st.set_page_config(page_title="EndeeRAG - Intelligent Assistant", page_icon="🤖", layout="wide")

# Custom CSS for better UI
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 20px 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        color: white;
        margin-bottom: 20px;
    }
    .developer-footer {
        text-align: center;
        padding: 20px;
        margin-top: 40px;
        border-top: 2px solid #e0e0e0;
        color: #666;
        font-size: 12px;
    }
    .social-links {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 10px;
    }
    .social-links a {
        text-decoration: none;
        color: #667eea;
        font-weight: bold;
        transition: color 0.3s;
    }
    .social-links a:hover {
        color: #764ba2;
    }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="main-header">
    <h1 style="margin: 0;">🤖 EndeeRAG</h1>
    <h3 style="margin: 5px 0; font-weight: 300;">Intelligent Document Assistant</h3>
</div>
""", unsafe_allow_html=True)

st.markdown("Upload a PDF document and ask questions about it. Powered by **Endee Vector Database** for sub-millisecond retrieval.")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Check if Endee is available
if not ENDEE_AVAILABLE:
    st.error("⚠️ Endee Vector Database is not available. Please ensure the Endee server is running on your local machine (localhost:8080).")
    st.info("This app requires a local Endee server to function. For local development, run the Endee server first.")
    st.stop()

# Sidebar for controls
with st.sidebar:
    st.header("1. Upload Document")
    uploaded_file = st.file_uploader("Choose a PDF file", type=["pdf"])
    
    if st.button("Process Document"):
        if uploaded_file is not None:
            with st.spinner("Extracting text and Upserting to Endee VDB..."):
                num_chunks, time_taken = rag_engine.process_and_upsert_pdf(uploaded_file)
                st.success(f"Processed into {num_chunks} chunks.")
                st.info(f"Upsert Time: {time_taken}s")
                st.session_state.doc_processed = True
        else:
            st.error("Please upload a file first.")
            
    st.divider()
    st.header("Endee DB Stats")
    if hasattr(st.session_state, 'doc_processed'):
        st.metric(label="Vectors Stored", value="Indexed")
        st.caption("Active connection to Endee Server")

# Main chat interface
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Ask a question about your document..."):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generate assistant response
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        
        # 1. Retrieve from Endee VDB
        with st.spinner("Searching Endee Vector Database..."):
            context_chunks, search_ms = rag_engine.query_endee(prompt)
            
        st.caption(f"⚡ *Retrieved {len(context_chunks)} chunks from Endee DB in {search_ms} ms*")
        
        # 2. Generate final answer
        with st.spinner("Generating answer..."):
            full_response = rag_engine.generate_answer(prompt, context_chunks)
            
        message_placeholder.markdown(full_response)
        
    st.session_state.messages.append({"role": "assistant", "content": full_response})

# Developer Footer
st.markdown("""
<div class="developer-footer">
    <p style="margin: 0;">Built with ❤️ by <strong>Sricharan Boggavarapu</strong></p>
    <div class="social-links">
        <a href="https://www.linkedin.com/in/boggavarapu-sricharan" target="_blank">🔗 LinkedIn</a>
        <a href="https://github.com/Sricharan-boggavarapu" target="_blank">🐙 GitHub</a>
    </div>
</div>
""", unsafe_allow_html=True)
