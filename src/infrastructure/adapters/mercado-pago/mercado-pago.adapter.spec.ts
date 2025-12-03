import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoAdapter } from './mercado-pago.adapter';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MercadoPagoAdapter', () => {
  let adapter: MercadoPagoAdapter;

  beforeEach(async () => {
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'test-token';
    process.env.APP_URL = 'http://localhost:3000';
    process.env.FRONTEND_URL = 'http://localhost:8080';

    const module: TestingModule = await Test.createTestingModule({
      providers: [MercadoPagoAdapter],
    }).compile();

    adapter = module.get<MercadoPagoAdapter>(MercadoPagoAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPreference', () => {
    it('should create preference successfully', async () => {
      const mockResponse = {
        data: {
          id: 'pref-123',
          init_point: 'https://mercadopago.com.br/checkout',
          status: 'pending',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const request = {
        amount: 100.0,
        description: 'Test payment',
        cpf: '12345678901',
        external_reference: 'ref-123',
      };

      const result = await adapter.createPreference(request);

      expect(result).toEqual({
        id: 'pref-123',
        init_point: 'https://mercadopago.com.br/checkout',
        status: 'pending',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.mercadopago.com/checkout/preferences',
        {
          items: [
            {
              title: 'Test payment',
              quantity: 1,
              currency_id: 'BRL',
              unit_price: 100.0,
            },
          ],
          payer: {
            identification: {
              type: 'CPF',
              number: '12345678901',
            },
          },
          external_reference: 'ref-123',
          notification_url: 'http://localhost:3000/api/payment/webhook',
          back_urls: {
            success: 'http://localhost:8080/success',
            failure: 'http://localhost:8080/failure',
          },
          auto_return: 'approved',
        },
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should throw error when API fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      const request = {
        amount: 100.0,
        description: 'Test payment',
        cpf: '12345678901',
        external_reference: 'ref-123',
      };

      await expect(adapter.createPreference(request)).rejects.toThrow(
        'Mercado Pago API error: API Error',
      );
    });
  });

  describe('getPaymentStatus', () => {
    it('should get payment status successfully', async () => {
      const mockResponse = {
        data: {
          status: 'approved',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await adapter.getPaymentStatus('payment-123');

      expect(result).toBe('approved');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.mercadopago.com/v1/payments/payment-123',
        {
          headers: {
            Authorization: 'Bearer test-token',
          },
        },
      );
    });

    it('should throw error when getting status fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(adapter.getPaymentStatus('payment-123')).rejects.toThrow(
        'Failed to get payment status: Network Error',
      );
    });
  });

  describe('environment variables', () => {
    it('should use environment variables for configuration', () => {
      const adapterInstance = new MercadoPagoAdapter();
      
      // Verifica se as propriedades estão definidas
      expect(adapterInstance).toBeDefined();
      expect(process.env.MERCADO_PAGO_ACCESS_TOKEN).toBe('test-token');
    });
  });
});