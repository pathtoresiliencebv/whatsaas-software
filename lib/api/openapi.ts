export const kyrnOpenApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Kyrn API',
    version: '1.0.0',
    summary: 'WhatsApp-, spraakagent- en automatiserings-API voor Kyrn-workspaces.',
    description:
      'Gebruik de Kyrn API om WhatsApp-berichten te versturen, workspace-data uit te lezen, spraakagents te beheren, workflows te publiceren en voice-agent tests te starten. Maak API-sleutels aan in Kyrn via Instellingen -> Ontwikkelaars. English documentation is available at /en/docs/api.',
    contact: {
      name: 'Kyrn',
      url: 'https://kyrn.nl',
    },
  },
  servers: [
    {
      url: 'https://api.kyrn.nl',
      description: 'Productie-API',
    },
    {
      url: 'https://kyrn.nl',
      description: 'Productiedomein van de app',
    },
  ],
  tags: [
    {
      name: 'WhatsApp-berichten',
      description: 'Verstuur uitgaande WhatsApp-tekst- en mediaberichten.',
    },
    {
      name: 'WhatsApp-data',
      description: 'Lees gekoppelde WhatsApp-instanties, chats en sjablonen uit.',
    },
    {
      name: 'Spraakagents',
      description: 'Maak spraakagents aan en beheer hun workflowdefinities.',
    },
    {
      name: 'Voice-runs',
      description: 'Start en bekijk API-testruns voor spraakagents.',
    },
    {
      name: 'Provider-webhooks',
      description: 'Inkomende endpoints voor Meta, Evolution API en Twilio.',
    },
  ],
  security: [{ bearerAuth: [] }],
  paths: {
    '/v1/send': {
      post: {
        tags: ['WhatsApp-berichten'],
        operationId: 'sendWhatsAppMessage',
        summary: 'WhatsApp-bericht versturen',
        description:
          'Verstuur een tekst-, afbeelding-, video-, document- of audiobericht via een gekoppelde WhatsApp-instantie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WhatsAppSendRequest' },
              examples: {
                text: {
                  summary: 'Tekstbericht',
                  value: {
                    instanceName: 'my-instance-name',
                    number: '5511999999999',
                    type: 'text',
                    message: 'Hallo vanuit de Kyrn API!',
                  },
                },
                image: {
                  summary: 'Afbeeldingsbericht',
                  value: {
                    instanceName: 'my-instance-name',
                    number: '5511999999999',
                    type: 'image',
                    mediaUrl: 'https://example.com/product.jpg',
                    message: 'Hier is de afbeelding.',
                    fileName: 'product.jpg',
                    mimetype: 'image/jpeg',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Bericht verstuurd en opgeslagen.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WhatsAppSendResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/RateLimited' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/v1/whatsapp/instances': {
      get: {
        tags: ['WhatsApp-data'],
        operationId: 'listWhatsAppInstances',
        summary: 'WhatsApp-instanties ophalen',
        description: 'Geeft veilige metadata terug voor WhatsApp-instanties die aan de geauthenticeerde workspace gekoppeld zijn.',
        responses: {
          '200': {
            description: 'Gekoppelde WhatsApp-instanties.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    instances: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/WhatsAppInstance' },
                    },
                  },
                  required: ['instances'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/v1/whatsapp/chats': {
      get: {
        tags: ['WhatsApp-data'],
        operationId: 'listWhatsAppChats',
        summary: 'WhatsApp-chats ophalen',
        parameters: [
          {
            name: 'instanceName',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filter chats op instantienaam.',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            description: 'Maximaal aantal chats om terug te geven.',
          },
        ],
        responses: {
          '200': {
            description: 'Chats gesorteerd op timestamp van het laatste bericht.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    chats: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/WhatsAppChat' },
                    },
                  },
                  required: ['chats'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/v1/whatsapp/templates': {
      get: {
        tags: ['WhatsApp-data'],
        operationId: 'listWhatsAppTemplates',
        summary: 'WhatsApp-sjablonen ophalen',
        parameters: [
          {
            name: 'instanceName',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filter sjablonen op instantienaam.',
          },
        ],
        responses: {
          '200': {
            description: 'WABA-sjablonen van de workspace.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    templates: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/WhatsAppTemplate' },
                    },
                  },
                  required: ['templates'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/v1/voice/agents': {
      get: {
        tags: ['Spraakagents'],
        operationId: 'listVoiceAgents',
        summary: 'Spraakagents ophalen',
        responses: {
          '200': {
            description: 'Spraakagents in de workspace.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    agents: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/VoiceAgent' },
                    },
                  },
                  required: ['agents'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Spraakagents'],
        operationId: 'createVoiceAgent',
        summary: 'Spraakagent aanmaken',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VoiceAgentCreateRequest' },
              example: {
                name: 'Support intake agent',
                description: 'Kwalificeert inkomende supportgesprekken.',
                channelMode: 'phone',
                systemPrompt: 'Greet callers, collect the problem and decide the next step.',
                isDefaultForWhatsapp: false,
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Spraakagent aangemaakt.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    agent: { $ref: '#/components/schemas/VoiceAgent' },
                  },
                  required: ['agent'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '402': {
            description: 'De workspace heeft niet genoeg beltegoed voor deze run.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  error: 'This team needs 1 voice credit(s), but only has 0.',
                  code: 'INSUFFICIENT_VOICE_CREDITS',
                },
              },
            },
          },
        },
      },
    },
    '/v1/voice/agents/{agentId}/definition': {
      get: {
        tags: ['Spraakagents'],
        operationId: 'getVoiceAgentDefinition',
        summary: 'Workflowdefinitie van spraakagent ophalen',
        parameters: [{ $ref: '#/components/parameters/AgentId' }],
        responses: {
          '200': {
            description: 'Actieve definitie en versiegeschiedenis.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    definition: { $ref: '#/components/schemas/VoiceWorkflowDefinition' },
                    definitions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/VoiceWorkflowDefinition' },
                    },
                  },
                  required: ['definition', 'definitions'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      patch: {
        tags: ['Spraakagents'],
        operationId: 'saveVoiceAgentDefinition',
        summary: 'Concept-workflowdefinitie opslaan',
        parameters: [{ $ref: '#/components/parameters/AgentId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VoiceWorkflowSaveRequest' },
              example: {
                workflowJson: {
                  nodes: [],
                  edges: [],
                },
                variables: {
                  language: 'nl',
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Workflowdefinitie opgeslagen.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VoiceWorkflowDefinition' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Spraakagents'],
        operationId: 'publishVoiceAgentDefinition',
        summary: 'Workflowdefinitie publiceren',
        parameters: [{ $ref: '#/components/parameters/AgentId' }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  definitionId: {
                    type: 'integer',
                    description: 'Optionele opgeslagen definitieversie om te publiceren. Standaard wordt het laatste concept gebruikt.',
                  },
                },
              },
              example: {
                definitionId: 42,
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Workflowdefinitie gepubliceerd.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VoiceWorkflowDefinition' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/v1/voice/runs': {
      get: {
        tags: ['Voice-runs'],
        operationId: 'listVoiceRuns',
        summary: 'Voice-agent runs ophalen',
        parameters: [
          {
            name: 'agentId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Filter runs voor één agent.',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          },
        ],
        responses: {
          '200': {
            description: 'Voice-agent runs.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    runs: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/VoiceRun' },
                    },
                  },
                  required: ['runs'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Voice-runs'],
        operationId: 'createVoiceRun',
        summary: 'API-run voor spraakagent starten en afronden',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VoiceRunCreateRequest' },
              example: {
                agentId: 3,
                input: 'Hallo, ik heb hulp nodig met mijn bestelling.',
                channel: 'api',
                direction: 'outbound',
                toNumber: '+31612345678',
                reserveCredits: 1,
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Run afgerond met gegenereerde agent-output.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    run: { $ref: '#/components/schemas/VoiceRun' },
                    output: { type: 'string' },
                  },
                  required: ['run', 'output'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/webhook/evolution': {
      post: {
        tags: ['Provider-webhooks'],
        operationId: 'evolutionWebhook',
        summary: 'Evolution API webhook ontvangen',
        security: [],
        description:
          'Inkomend webhook-endpoint voor bericht-, verbindings- en status-events van Evolution API. Configureer deze URL in Evolution API, niet in client-side code. Als webhookverificatie is ingesteld, moet Evolution het token meesturen via `X-Webhook-Auth` of `X-Hook-Secret`.',
        parameters: [
          {
            name: 'X-Webhook-Auth',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Evolution webhook-token wanneer webhookverificatie is ingeschakeld.',
          },
          {
            name: 'X-Hook-Secret',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Alternatieve header voor het webhook-token.',
          },
        ],
        requestBody: { $ref: '#/components/requestBodies/ProviderWebhookPayload' },
        responses: {
          '200': { description: 'Event geaccepteerd.' },
          '400': { $ref: '#/components/responses/BadRequest' },
          '403': {
            description: 'Webhook-token ontbreekt of is ongeldig.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Forbidden' },
              },
            },
          },
        },
      },
    },
    '/webhook/meta-cloud': {
      get: {
        tags: ['Provider-webhooks'],
        operationId: 'verifyMetaCloudWebhook',
        summary: 'Meta Cloud webhook verifiëren',
        security: [],
        parameters: [
          { name: 'hub.mode', in: 'query', schema: { type: 'string' }, required: false },
          { name: 'hub.verify_token', in: 'query', schema: { type: 'string' }, required: false },
          { name: 'hub.challenge', in: 'query', schema: { type: 'string' }, required: false },
        ],
        responses: {
          '200': { description: 'Challenge-response of verificatiestatus.' },
        },
      },
      post: {
        tags: ['Provider-webhooks'],
        operationId: 'metaCloudWebhook',
        summary: 'Meta Cloud webhook ontvangen',
        security: [],
        requestBody: { $ref: '#/components/requestBodies/ProviderWebhookPayload' },
        responses: {
          '200': { description: 'Event geaccepteerd.' },
        },
      },
    },
    '/webhook/twilio/voice': {
      post: {
        tags: ['Provider-webhooks'],
        operationId: 'twilioVoiceWebhook',
        summary: 'Twilio voice-webhook ontvangen',
        security: [],
        description:
          'Twilio roept dit endpoint aan tijdens het opzetten van een telefoongesprek. Payloads worden door Twilio als form data verzonden.',
        requestBody: {
          content: {
            'application/x-www-form-urlencoded': {
              schema: { $ref: '#/components/schemas/TwilioVoiceWebhookPayload' },
            },
          },
        },
        responses: {
          '200': { description: 'TwiML of event-response.' },
        },
      },
    },
    '/voice/runtime/events': {
      post: {
        tags: ['Provider-webhooks'],
        operationId: 'voiceRuntimeEvents',
        summary: 'Voice-runtime event ontvangen',
        security: [],
        requestBody: { $ref: '#/components/requestBodies/ProviderWebhookPayload' },
        responses: {
          '200': { description: 'Runtime-event geaccepteerd.' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API key',
        description: 'Gebruik `Authorization: Bearer sk_live_...` met een API-sleutel uit Instellingen -> Ontwikkelaars.',
      },
    },
    parameters: {
      AgentId: {
        name: 'agentId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'ID van de spraakagent.',
      },
    },
    requestBodies: {
      ProviderWebhookPayload: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'De request-payload of query is ongeldig.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Unauthorized: {
        description: 'Het API-token ontbreekt of is ongeldig.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { error: 'Niet geautoriseerd. API-token ontbreekt of is ongeldig.' },
          },
        },
      },
      NotFound: {
        description: 'De gevraagde resource is niet gevonden.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      RateLimited: {
        description: 'De workspace heeft de limiet overschreden.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      InternalError: {
        description: 'Onverwachte serverfout.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: {},
        },
        required: ['error'],
      },
      WhatsAppSendRequest: {
        type: 'object',
        properties: {
          instanceName: { type: 'string', minLength: 1 },
          number: {
            type: 'string',
            minLength: 1,
            description: 'Telefoonnummer. Niet-cijfers worden verwijderd voor verzending.',
          },
          type: {
            type: 'string',
            enum: ['text', 'image', 'video', 'document', 'audio'],
          },
          message: {
            type: 'string',
            description: 'Verplicht voor tekstberichten. Wordt als caption gebruikt bij mediaberichten.',
          },
          mediaUrl: {
            type: 'string',
            format: 'uri',
            description: 'Verplicht voor afbeelding-, video-, document- en audioberichten.',
          },
          fileName: { type: 'string' },
          mimetype: { type: 'string' },
        },
        required: ['instanceName', 'number', 'type'],
      },
      WhatsAppSendResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            additionalProperties: true,
          },
        },
        required: ['success', 'data'],
      },
      WhatsAppInstance: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          instanceName: { type: 'string' },
          displayName: { type: ['string', 'null'] },
          instanceNumber: { type: ['string', 'null'] },
          integration: { type: ['string', 'null'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      WhatsAppChat: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          instanceName: { type: ['string', 'null'] },
          remoteJid: { type: 'string' },
          name: { type: ['string', 'null'] },
          pushName: { type: ['string', 'null'] },
          lastMessageText: { type: ['string', 'null'] },
          lastMessageTimestamp: { type: ['string', 'null'], format: 'date-time' },
          unreadCount: { type: ['integer', 'null'] },
          lastMessageStatus: { type: ['string', 'null'] },
          lastMessageFromMe: { type: ['boolean', 'null'] },
        },
      },
      WhatsAppTemplate: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          instanceName: { type: 'string' },
          metaId: { type: ['string', 'null'] },
          name: { type: 'string' },
          language: { type: 'string' },
          category: { type: ['string', 'null'] },
          status: { type: ['string', 'null'] },
          components: { type: ['array', 'object', 'null'] },
          updatedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      VoiceAgent: {
        type: 'object',
        additionalProperties: true,
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: ['string', 'null'] },
          channelMode: { type: ['string', 'null'] },
          status: { type: ['string', 'null'] },
          systemPrompt: { type: ['string', 'null'] },
          isDefaultForWhatsapp: { type: ['boolean', 'null'] },
          workflowJson: { type: ['object', 'array', 'null'], additionalProperties: true },
          metadata: { type: ['object', 'null'], additionalProperties: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      VoiceAgentCreateRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          systemPrompt: { type: 'string' },
          channelMode: { type: 'string', enum: ['phone', 'browser', 'whatsapp', 'api'] },
          isDefaultForWhatsapp: { type: 'boolean' },
          metadata: { type: 'object', additionalProperties: true },
          workflowJson: { type: 'object', additionalProperties: true },
        },
        required: ['name'],
      },
      VoiceWorkflowDefinition: {
        type: ['object', 'null'],
        additionalProperties: true,
        properties: {
          id: { type: 'integer' },
          agentId: { type: 'integer' },
          status: { type: 'string' },
          version: { type: 'integer' },
          workflowJson: { type: ['object', 'array'], additionalProperties: true },
          variables: { type: ['object', 'null'], additionalProperties: true },
          createdAt: { type: 'string', format: 'date-time' },
          publishedAt: { type: ['string', 'null'], format: 'date-time' },
        },
      },
      VoiceWorkflowSaveRequest: {
        type: 'object',
        properties: {
          workflowJson: { type: ['object', 'array'], additionalProperties: true },
          workflow: { type: ['object', 'array'], additionalProperties: true },
          definition: { type: ['object', 'array'], additionalProperties: true },
          variables: { type: 'object', additionalProperties: true },
        },
      },
      VoiceRun: {
        type: 'object',
        additionalProperties: true,
        properties: {
          id: { type: 'integer' },
          agentId: { type: 'integer' },
          channel: { type: 'string' },
          direction: { type: 'string' },
          status: { type: 'string' },
          input: { type: ['string', 'null'] },
          output: { type: ['string', 'null'] },
          fromNumber: { type: ['string', 'null'] },
          toNumber: { type: ['string', 'null'] },
          durationSeconds: { type: ['integer', 'null'] },
          createdAt: { type: 'string', format: 'date-time' },
          completedAt: { type: ['string', 'null'], format: 'date-time' },
        },
      },
      VoiceRunCreateRequest: {
        type: 'object',
        properties: {
          agentId: { type: 'integer' },
          input: { type: 'string' },
          channel: { type: 'string', default: 'api' },
          direction: { type: 'string', enum: ['inbound', 'outbound'], default: 'outbound' },
          fromNumber: { type: 'string' },
          toNumber: { type: 'string' },
          reserveCredits: { type: 'integer', default: 1 },
        },
        required: ['agentId'],
      },
      TwilioVoiceWebhookPayload: {
        type: 'object',
        properties: {
          CallSid: { type: 'string' },
          AccountSid: { type: 'string' },
          From: { type: 'string' },
          To: { type: 'string' },
          CallStatus: { type: 'string' },
          Direction: { type: 'string' },
        },
        additionalProperties: true,
      },
    },
  },
} as const;
