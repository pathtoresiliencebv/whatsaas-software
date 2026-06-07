import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    openapi: '3.1.0',
    info: {
      title: 'Kyrn API',
      version: '1.0.0',
      description: 'Nederlandse API-documentatie voor WhatsApp-berichten en voice agents.',
    },
    servers: [
      { url: 'https://api.kyrn.nl', description: 'Productie API' },
      { url: 'https://kyrn.nl', description: 'Dashboard domein' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API key',
        },
      },
      schemas: {
        VoiceAgent: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: ['string', 'null'] },
            status: { type: 'string', examples: ['draft'] },
            provider: { type: 'string', examples: ['openai'] },
            model: { type: 'string', examples: ['gpt-realtime-2'] },
            voice: { type: 'string', examples: ['alloy'] },
            prompt: { type: ['string', 'null'] },
            config: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/v1/send': {
        post: {
          tags: ['WhatsApp'],
          summary: 'Verstuur een WhatsApp-bericht',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['instanceName', 'number', 'type'],
                  properties: {
                    instanceName: { type: 'string' },
                    number: { type: 'string' },
                    type: { type: 'string', enum: ['text', 'image', 'video', 'document', 'audio'] },
                    message: { type: 'string' },
                    mediaUrl: { type: 'string', format: 'uri' },
                    fileName: { type: 'string' },
                    mimetype: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Bericht verstuurd' },
            '401': { description: 'API-token ontbreekt of is ongeldig' },
          },
        },
      },
      '/api/v1/voice/agents': {
        get: {
          tags: ['Voice'],
          summary: 'Lijst met voice agents ophalen',
          responses: {
            '200': {
              description: 'Voice agents',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/VoiceAgent' },
                      },
                    },
                  },
                },
              },
            },
            '401': { description: 'API-token ontbreekt of is ongeldig' },
          },
        },
        post: {
          tags: ['Voice'],
          summary: 'Maak een voice agent aan',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    provider: { type: 'string', default: 'openai' },
                    model: { type: 'string', default: 'gpt-realtime-2' },
                    voice: { type: 'string', default: 'alloy' },
                    prompt: { type: 'string' },
                    config: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Voice agent aangemaakt' },
            '400': { description: 'Ongeldige payload' },
            '401': { description: 'API-token ontbreekt of is ongeldig' },
          },
        },
      },
    },
  });
}
