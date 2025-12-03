// DTOs específicos para a integração com Mercado Pago
export interface MercadoPagoPreferenceRequest {
  items: Array<{
    title: string;
    quantity: number;
    currency_id: string;
    unit_price: number;
  }>;
  payer: {
    identification: {
      type: string;
      number: string;
    };
  };
  external_reference: string;
  notification_url: string;
  back_urls: {
    success: string;
    failure: string;
  };
  auto_return: string;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  date_created: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
}

export interface MercadoPagoPaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  date_approved?: string;
  date_created: string;
  description: string;
  transaction_amount: number;
}
