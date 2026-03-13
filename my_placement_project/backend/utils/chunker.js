function chunkText(text, chunkSize = 200, overlap = 20) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim()) chunks.push(chunk.trim());
    if (i + chunkSize >= words.length) break;
  }
  // Limit to max 20 chunks to avoid rate limits on free tier
  return chunks.slice(0, 20);
}

function makeVectorId(docId, chunkIndex) {
  return `${docId}-chunk-${chunkIndex}`;
}

function sanitizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\s{3,}/g, "  ")
    .trim();
}

module.exports = { chunkText, makeVectorId, sanitizeText };
