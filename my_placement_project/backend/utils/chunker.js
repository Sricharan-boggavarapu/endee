/**
 * Split text into overlapping chunks for better semantic coverage
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim()) chunks.push(chunk.trim());
    if (i + chunkSize >= words.length) break;
  }

  return chunks;
}

/**
 * Generate a unique vector ID from document metadata
 */
function makeVectorId(docId, chunkIndex) {
  return `${docId}-chunk-${chunkIndex}`;
}

/**
 * Sanitize text for embedding (remove excessive whitespace, etc.)
 */
function sanitizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\s{3,}/g, "  ")
    .trim();
}

module.exports = { chunkText, makeVectorId, sanitizeText };
