import { api } from './api';

export interface CekBotIntegrationStatus {
  name: 'slack' | 'discord' | 'twilio' | 'sendgrid' | 'mapbox' | 'supabase';
  active: boolean;
  purpose: string;
}

export interface CekBotMessageResponse {
  id: string;
  reply: string;
  suggestedActions: string[];
  escalation: {
    needed: boolean;
    reason?: string;
    availableChannels: CekBotIntegrationStatus['name'][];
  };
  integrations: CekBotIntegrationStatus[];
}

export async function sendCekBotMessage(message: string) {
  return api<CekBotMessageResponse>('/cekbot/messages', {
    method: 'POST',
    body: JSON.stringify({ message, channel: 'web' }),
  });
}
