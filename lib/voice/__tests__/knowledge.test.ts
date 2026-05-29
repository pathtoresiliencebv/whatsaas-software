import { describe, expect, it } from 'vitest';
import {
  chunkVoiceKnowledgeDocument,
  retrieveVoiceKnowledge,
} from '@/lib/voice/knowledge';

describe('voice knowledge base', () => {
  it('chunks a document into indexed knowledge chunks', () => {
    const chunks = chunkVoiceKnowledgeDocument({
      fileId: 4,
      text: 'Pricing is monthly. Enterprise customers can request custom onboarding. Support is available on WhatsApp.',
      maxChunkLength: 35,
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toMatchObject({ fileId: 4, chunkIndex: 0 });
  });

  it('retrieves the most relevant chunks for an agent query', () => {
    const chunks = chunkVoiceKnowledgeDocument({
      fileId: 4,
      text: 'Pricing is monthly. Enterprise onboarding includes a launch specialist. Support is available on WhatsApp.',
      maxChunkLength: 48,
    });

    const matches = retrieveVoiceKnowledge({
      query: 'Do enterprise customers get onboarding?',
      chunks,
      limit: 1,
    });

    expect(matches[0].content).toContain('Enterprise onboarding');
  });
});
