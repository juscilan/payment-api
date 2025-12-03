export interface CreatePreferenceRequest {
  amount: number;
  description: string;
  cpf: string;
  external_reference: string;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  status: string;
}

export interface WebhookNotification {
  action: string;
  api_version: string;
  data: { id: string };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

export interface MercadoPagoPort {
  createPreference(request: CreatePreferenceRequest): Promise<PreferenceResponse>;
  getPaymentStatus(paymentId: string): Promise<string>;
}
