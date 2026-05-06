export type CekBotIntegrationName = 'slack' | 'discord' | 'twilio' | 'sendgrid' | 'mapbox' | 'supabase';

export interface CekBotMessageRequest {
  message?: string;
  patientId?: string;
  channel?: 'web' | 'slack' | 'discord' | 'whatsapp' | 'email';
}

export interface CekBotIntegrationStatus {
  name: CekBotIntegrationName;
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
    availableChannels: CekBotIntegrationName[];
  };
  integrations: CekBotIntegrationStatus[];
}
