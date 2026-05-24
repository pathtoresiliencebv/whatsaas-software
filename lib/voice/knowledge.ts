export type VoiceKnowledgeChunk = {
  fileId: number;
  chunkIndex: number;
  content: string;
  metadata?: Record<string, any>;
};

export function chunkVoiceKnowledgeDocument(params: {
  fileId: number;
  text: string;
  maxChunkLength?: number;
}): VoiceKnowledgeChunk[] {
  const maxChunkLength = Math.max(24, params.maxChunkLength || 900);
  const sentences = params.text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxChunkLength && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);

  return chunks.map((content, chunkIndex) => ({
    fileId: params.fileId,
    chunkIndex,
    content,
    metadata: { source: 'voice_file' },
  }));
}

export function retrieveVoiceKnowledge(params: {
  query: string;
  chunks: VoiceKnowledgeChunk[];
  limit?: number;
}) {
  const terms = tokenize(params.query);
  return params.chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(terms, chunk.content) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score || a.chunkIndex - b.chunkIndex)
    .slice(0, params.limit || 4);
}

function scoreChunk(queryTerms: string[], content: string) {
  const contentTerms = tokenize(content);
  const contentSet = new Set(contentTerms);
  return queryTerms.reduce((score, term) => score + (contentSet.has(term) ? 2 : content.includes(term) ? 1 : 0), 0);
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 2);
}
