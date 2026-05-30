import type { WhatsAppInstanceConfig, SendTextPayload, SendMediaPayload, SendAudioPayload, SendReactionPayload, SendInteractivePayload, SendTemplatePayload, SendResult, ConnectionStatus } from '@/lib/whatsapp/types';

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v21.0';
const GRAPH_API_BASE_URL = process.env.META_GRAPH_API_BASE_URL || `https://graph.facebook.com/${GRAPH_API_VERSION}`;

function cleanNumber(remoteJid: string): string {
  return remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '').replace(/\D/g, '');
}

function buildContext(quoted?: { id: string; text?: string }) {
  return quoted ? { message_id: quoted.id } : undefined;
}

export class MetaCloudProvider {
  readonly providerType = 'meta-cloud';
  private token: string;
  private phoneNumberId: string;

  constructor(config: WhatsAppInstanceConfig) {
    if (!config.metaToken || !config.metaPhoneNumberId) {
      throw new Error('metaToken and metaPhoneNumberId are required for Meta Cloud provider');
    }
    this.token = config.metaToken;
    this.phoneNumberId = config.metaPhoneNumberId;
  }

  private get messagesUrl() {
    return `${GRAPH_API_BASE_URL}/${this.phoneNumberId}/messages`;
  }

  private get mediaUrl() {
    return `${GRAPH_API_BASE_URL}/${this.phoneNumberId}/media`;
  }

  private authHeaders(extra?: Record<string, string>) {
    return {
      Authorization: `Bearer ${this.token}`,
      ...extra,
    };
  }

  private async readJson(response: Response): Promise<any> {
    if (typeof response.json === 'function' && typeof response.text !== 'function') {
      return response.json().catch(() => ({}));
    }
    const text = await response.text().catch(() => '');
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { error: { message: text } };
    }
  }

  private parseResult(ok: boolean, status: number, data: any): SendResult {
    if (ok) {
      return {
        success: true,
        messageId: data?.messages?.[0]?.id,
        raw: data,
      };
    }

    const message = data?.error?.message || data?.message || 'Unknown Meta Cloud API error';
    return {
      success: false,
      error: status === 429 ? `Rate limited: ${message}` : message,
      raw: data,
    };
  }

  private async sendMessage(body: Record<string, any>): Promise<SendResult> {
    const response = await fetch(this.messagesUrl, {
      method: 'POST',
      headers: this.authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    });
    return this.parseResult(response.ok, response.status, await this.readJson(response));
  }

  private async uploadMedia(mediaBase64: string, mimetype: string): Promise<{ ok: boolean; id?: string; error?: string; raw?: any }> {
    const binary = Buffer.from(mediaBase64.replace(/^data:[^;]+;base64,/, ''), 'base64');
    const form = new FormData();
    form.append('messaging_product', 'whatsapp');
    form.append('type', mimetype);
    form.append('file', new Blob([binary], { type: mimetype }), 'upload');

    const response = await fetch(this.mediaUrl, {
      method: 'POST',
      headers: this.authHeaders(),
      body: form,
    });
    const data = await this.readJson(response);
    if (!response.ok || !data?.id) {
      return { ok: false, error: data?.error?.message || 'Unknown upload error', raw: data };
    }
    return { ok: true, id: data.id, raw: data };
  }

  async sendText(remoteJid: string, payload: SendTextPayload): Promise<SendResult> {
    const body: any = {
      messaging_product: 'whatsapp',
      to: cleanNumber(remoteJid),
      type: 'text',
      text: {
        body: payload.text,
        preview_url: true,
      },
    };
    const context = buildContext(payload.quoted);
    if (context) body.context = context;
    return this.sendMessage(body);
  }

  async sendMedia(remoteJid: string, payload: SendMediaPayload): Promise<SendResult> {
    const upload = await this.uploadMedia(payload.mediaBase64, payload.mimetype);
    if (!upload.ok || !upload.id) {
      return { success: false, error: `Failed to upload media: ${upload.error}`, raw: upload.raw };
    }

    const mediaPayload: any = { id: upload.id };
    if (payload.caption && payload.mediaType !== 'document') mediaPayload.caption = payload.caption;
    if (payload.mediaType === 'document') {
      if (payload.fileName) mediaPayload.filename = payload.fileName;
      if (payload.caption) mediaPayload.caption = payload.caption;
    }

    const body: any = {
      messaging_product: 'whatsapp',
      to: cleanNumber(remoteJid),
      type: payload.mediaType,
      [payload.mediaType]: mediaPayload,
    };
    const context = buildContext(payload.quoted);
    if (context) body.context = context;
    return this.sendMessage(body);
  }

  async sendAudio(remoteJid: string, payload: SendAudioPayload): Promise<SendResult> {
    const upload = await this.uploadMedia(payload.audioBase64, payload.mimetype || 'audio/mpeg');
    if (!upload.ok || !upload.id) {
      return { success: false, error: `Failed to upload media: ${upload.error}`, raw: upload.raw };
    }

    const body: any = {
      messaging_product: 'whatsapp',
      to: cleanNumber(remoteJid),
      type: 'audio',
      audio: { id: upload.id },
    };
    const context = buildContext(payload.quoted);
    if (context) body.context = context;
    return this.sendMessage(body);
  }

  async sendReaction(remoteJid: string, payload: SendReactionPayload): Promise<SendResult> {
    return this.sendMessage({
      messaging_product: 'whatsapp',
      to: cleanNumber(remoteJid),
      type: 'reaction',
      reaction: {
        message_id: payload.messageId,
        emoji: payload.emoji || '',
      },
    });
  }

  async sendInteractive(remoteJid: string, payload: SendInteractivePayload): Promise<SendResult> {
    return this.sendMessage({
      messaging_product: 'whatsapp',
      to: cleanNumber(remoteJid),
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
      to: cleanNumber(remoteJid),
      type: 'template',
      template: {
        name: payload.templateName,
        language: { code: payload.language },
        components: payload.components || [],
      },
    });
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const response = await fetch(`${GRAPH_API_BASE_URL}/${this.phoneNumberId}?fields=verified_name`, {
        headers: this.authHeaders(),
      });
      if (response.ok) return 'open';
      if (response.status === 401 || response.status === 403) return 'close';
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  async disconnect(): Promise<void> {
    // Meta Cloud API does not expose an instance logout operation.
  }
}
