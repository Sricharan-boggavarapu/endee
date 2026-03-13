const axios = require("axios");
const { embedText } = require("./embeddings");
const { searchVectors } = require("./endeeClient");

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function ragAnswer(collection, question, topK = 5) {
  // 1. Embed question and search Endee
  const queryVector = await embedText(question);
  const { matches } = await searchVectors(collection, queryVector, topK);

  if (!matches || matches.length === 0) {
    return {
      answer: "I couldn't find any relevant documents to answer your question. Please ingest some documents first.",
      sources: [],
    };
  }

  // 2. Build context
  const context = matches
    .map((m, i) => `[${i + 1}] ${m.metadata?.title || "Untitled"}: ${m.metadata?.content || ""}`)
    .join("\n\n");

  const sources = matches.map((m, i) => ({
    rank: i + 1,
    title: m.metadata?.title || "Untitled",
    score: parseFloat(m.score.toFixed(4)),
    excerpt: (m.metadata?.content || "").slice(0, 200),
  }));

  // 3. Generate answer with Groq (llama3)
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Answer questions using ONLY the provided context. Be concise and cite sources by number like [1], [2].",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const answer = response.data.choices?.[0]?.message?.content || "No answer generated.";
  return { answer, sources };
}

module.exports = { ragAnswer };
