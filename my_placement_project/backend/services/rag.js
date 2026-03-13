const OpenAI = require("openai");
const { embedText } = require("./embeddings");
const { searchVectors } = require("./endeeClient");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Full RAG pipeline: embed question → retrieve context → generate answer
 */
async function ragAnswer(collectionId, question, topK = 5) {
  // 1. Embed the question
  const queryVector = await embedText(question);

  // 2. Retrieve top-K relevant chunks from Endee
  const searchResults = await searchVectors(collectionId, queryVector, topK);
  const matches = searchResults.matches || searchResults.results || [];

  if (matches.length === 0) {
    return {
      answer: "I couldn't find any relevant documents to answer your question. Please ingest some documents first.",
      sources: [],
    };
  }

  // 3. Build context from retrieved chunks
  const context = matches
    .map((m, i) => {
      const meta = m.metadata || {};
      return `[Source ${i + 1}] ${meta.title || "Document"}\n${meta.content || meta.text || ""}`;
    })
    .join("\n\n---\n\n");

  // 4. Build RAG prompt
  const systemPrompt = `You are a helpful AI assistant. Answer the user's question based ONLY on the provided context documents.
If the context doesn't contain enough information, say so honestly.
Always cite which source(s) you used in your answer using [Source N] notation.
Be concise, accurate, and helpful.`;

  const userPrompt = `Context Documents:\n${context}\n\n---\n\nQuestion: ${question}\n\nAnswer:`;

  // 5. Generate answer with GPT
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 800,
    temperature: 0.3,
  });

  const answer = completion.choices[0].message.content;

  // 6. Format sources for frontend
  const sources = matches.map((m, i) => ({
    rank: i + 1,
    id: m.id,
    score: m.score || m.similarity || 0,
    title: m.metadata?.title || "Untitled",
    excerpt: (m.metadata?.content || m.metadata?.text || "").slice(0, 200) + "...",
    docId: m.metadata?.docId,
  }));

  return { answer, sources };
}

module.exports = { ragAnswer };
