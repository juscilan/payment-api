import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  MercadoPagoPort,
  CreatePreferenceRequest,
  PreferenceResponse,
} from '../../../domain/ports/external/mercado-pago.port';

@Injectable()
export class MercadoPagoAdapter implements MercadoPagoPort {
  private readonly baseUrl = 'https://api.mercadopago.com';
  private readonly accessToken: string;

  constructor() {
    this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
  }

  async createPreference(request: CreatePreferenceRequest): Promise<PreferenceResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/checkout/preferences`,
        {
          items: [
            {
              title: request.description,
              quantity: 1,
              currency_id: 'BRL',
              unit_price: request.amount,
            },
          ],
          payer: {
            identification: {
              type: 'CPF',
              number: request.cpf,
            },
          },
          external_reference: request.external_reference,
          notification_url: `${process.env.APP_URL}/api/payment/webhook`,
          back_urls: {
            success: `${process.env.FRONTEND_URL}/success`,
            failure: `${process.env.FRONTEND_URL}/failure`,
          },
          auto_return: 'approved',
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        id: response.data.id,
        init_point: response.data.init_point,
        status: response.data.status,
      };
    } catch (error) {
      throw new Error(`Mercado Pago API error: ${error.message}`);
    }
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      return response.data.status;
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }
}
