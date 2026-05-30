import type {
  ConnectionStatus,
  SendAudioPayload,
  SendInteractivePayload,
  SendMediaPayload,
  SendReactionPayload,
  SendResult,
  SendTemplatePayload,
  SendTextPayload,
  WhatsAppInstanceConfig,
  WhatsAppProvider,
} from '@/lib/whatsapp/types';

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v21.0';
const GRAPH_API_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

type GraphError = {
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
  };
};

export class MetaCloudProvider implements WhatsAppProvider {
  readonly providerType = 'meta-cloud';
  private config: WhatsAppInstanceConfig;
  private token: string;
  private phoneNumberId: string;

  constructor(config: WhatsAppInstanceConfig) {
    if (!config.metaToken || !config.metaPhoneNumberId) {
      throw new Error('META-CLOUD instances require metaToken and metaPhoneNumberId');
    }

    this.config = config;
    this.token = config.metaToken;
    this.phoneNumberId = config.metaPhoneNumberId;
  }

  private get messagesUrl() {
    return `${GRAPH_API_BASE_URL}/${this.phoneNumberId}/messages`;
  }

  private get mediaUrl() {
    return `${GRAPH_API_BASE_URL}/${this.phoneNumberId}/media`;
  }

  private get phoneNumberUrl() {
    return `${GRAPH_API_BASE_URL}/${this.phoneNumberId}`;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  private normalizeTo(remoteJid: string) {
    return remoteJid.split('@')[0].replace(/[^\d]/g, '');
  }

  private async readJson(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  private graphErrorMessage(status: number, body: GraphError) {
    const message = body.error?.message || `Meta Cloud API error (${status})`;
    return status === 429 ? `Rate limited: ${message}` : message;
  }

  private async sendMessage(body: Record<string, any>): Promise<SendResult> {
    try {
      const response = await fetch(this.messagesUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
      });

      const data = await this.readJson(response);

      if (!response.ok) {
        return {
          success: false,
          error: this.graphErrorMessage(response.status, data),
          raw: data,
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        raw: data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to send Meta Cloud message',
      };
    }
  }

  async sendText(remoteJid: string, payload: SendTextPayload): Promise<SendResult> {
    const body: Record<string, any> = {
      messaging_product: 'whatsapp',
      to: this.normalizeTo(remoteJid),
      type: 'text',
      text: {
        body: payload.text,
        preview_url: true,
      },
    };

    if (payload.quoted?.id) {
      body.context = { message_id: payload.quoted.id };
    }

    return this.sendMessage(body);
  }

  async sendMedia(remoteJid: string, payload: SendMediaPayload): Promise<SendResult> {
    const uploaded = await this.uploadMedia(payload.mediaBase64, payload.mimetype);

    if (!uploaded.success || !uploaded.messageId) {
      return {
        success: false,
        error: `Failed to upload media: ${uploaded.error || 'Unknown error'}`,
        raw: uploaded.raw,
      };
    }

    const mediaBody: Record<string, any> = { id: uploaded.messageId };

    if (payload.caption && payload.mediaType !== 'document') {
      mediaBody.caption = payload.caption;
    }

    if (payload.mediaType === 'document') {
      if (payload.caption) mediaBody.caption = payload.caption;
      if (payload.fileName) mediaBody.filename = payload.fileName;
    }

    const body: Record<string, any> = {
      messaging_product: 'whatsapp',
      to: this.normalizeTo(remoteJid),
      type: payload.mediaType,
      [payload.mediaType]: mediaBody,
    };

    if (payload.quoted?.id) {
      body.context = { message_id: payload.quoted.id };
    }

    return this.sendMessage(body);
  }

  async sendAudio(remoteJid: string, payload: SendAudioPayload): Promise<SendResult> {
    const uploaded = await this.uploadMedia(payload.audioBase64, payload.mimetype || 'audio/ogg');

    if (!uploaded.success || !uploaded.messageId) {
      return {
        success: false,
        error: `Failed to upload media: ${uploaded.error || 'Unknown error'}`,
        raw: uploaded.raw,
      };
    }

    const body: Record<string, any> = {
      messaging_product: 'whatsapp',
      to: this.normalizeTo(remoteJid),
      type: 'audio',
      audio: {
        id: uploaded.messageId,
      },
    };

    if (payload.quoted?.id) {
      body.context = { message_id: payload.quoted.id };
    }

    return this.sendMessage(body);
  }

  async sendReaction(remoteJid: string, payload: SendReactionPayload): Promise<SendResult> {
    return this.sendMessage({
      messaging_product: 'whatsapp',
      to: this.normalizeTo(remoteJid),
      type: 'reaction',
      reaction: {
        message_id: payload.messageId,
        emoji: payload.emoji,
      },
    });
  }

  async sendInteractive(remoteJid: string, payload: SendInteractivePayload): Promise<SendResult> {
    return this.sendMessage({
      messaging_product: 'whatsapp',
      to: this.normalizeTo(remoteJid),
      type: 'interactive',
      interactive: {
        type: payload.type,
        header: payload.header,
        body: payload.body,
        footer: payload.footer,
        action: payload.action,
      },
    });
  }

  async sendTemplate(remoteJid: string, payload: SendTemplatePayload): Promise<SendResult> {
    return this.sendMessage({
      messaging_product: 'whatsapp',
      to: this.normalizeTo(remoteJid),
      type: 'template',
      template: {
        name: payload.templateName,
        language: {
          code: payload.language,
        },
        components: payload.components,
      },
    });
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const response = await fetch(this.phoneNumberUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) return 'open';
      if (response.status === 401 || response.status === 403) return 'close';
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  async disconnect(): Promise<void> {
    return;
  }

  private async uploadMedia(mediaBase64: string, mimetype: string): Promise<SendResult> {
    try {
      const formData = new FormData();
      const buffer = Buffer.from(mediaBase64.includes(',') ? mediaBase64.split(',').pop()! : mediaBase64, 'base64');
      const blob = new Blob([buffer], { type: mimetype });

      formData.append('messaging_product', 'whatsapp');
      formData.append('file', blob, `upload.${mimetype.split('/')[1] || 'bin'}`);

      const response = await fetch(this.mediaUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: formData,
      });

      const data = await this.readJson(response);

      if (!response.ok) {
        return {
          success: false,
          error: this.graphErrorMessage(response.status, data),
          raw: data,
        };
      }

      return {
        success: true,
        messageId: data.id,
        raw: data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to upload media',
      };
    }
  }
}
