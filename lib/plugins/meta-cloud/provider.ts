// Meta Cloud API provider stub - plugin not enabled
import type { WhatsAppInstanceConfig, SendTextPayload, SendMediaPayload, SendAudioPayload, SendReactionPayload, SendInteractivePayload, SendTemplatePayload, SendResult, ConnectionStatus } from '@/lib/whatsapp/types';

export class MetaCloudProvider {
  readonly providerType = 'meta-cloud';
  private config: WhatsAppInstanceConfig;

  constructor(config: WhatsAppInstanceConfig) {
    this.config = config;
  }

  async sendText(remoteJid: string, payload: SendTextPayload): Promise<SendResult> {
    throw new Error('Meta Cloud plugin is not enabled');
  }

  async sendMedia(remoteJid: string, payload: SendMediaPayload): Promise<SendResult> {
    throw new Error('Meta Cloud plugin is not enabled');
  }

  async sendAudio(remoteJid: string, payload: SendAudioPayload): Promise<SendResult> {
    throw new Error('Meta Cloud plugin is not enabled');
  }

  async sendReaction(remoteJid: string, payload: SendReactionPayload): Promise<SendResult> {
    throw new Error('Meta Cloud plugin is not enabled');
  }

  async sendInteractive(remoteJid: string, payload: SendInteractivePayload): Promise<SendResult> {
    throw new Error('Meta Cloud plugin is not enabled');
  }

  async sendTemplate(remoteJid: string, payload: SendTemplatePayload): Promise<SendResult> {
    throw new Error('Meta Cloud plugin is not enabled');
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    return 'unknown';
  }

  async disconnect(): Promise<void> {
    // No-op stub
  }
}
