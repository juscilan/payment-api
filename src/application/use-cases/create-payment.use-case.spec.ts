import { Test, TestingModule } from '@nestjs/testing';
import { CreatePaymentUseCase } from './create-payment.use-case';
import { PaymentMethod } from '../../domain/enums/payment-method.enum'; // Corrected path or filename
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import {
  InvalidPaymentDataException,
  ExternalPaymentException,
} from '../../domain/exceptions/payment.exception';

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  let mockPaymentRepository: any;
  let mockMercadoPagoAdapter: any;

  beforeEach(async () => {
    mockPaymentRepository = {
      save: jest.fn(),
    };

    mockMercadoPagoAdapter = {
      createPreference: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePaymentUseCase,
        {
          provide: 'PaymentRepositoryPort',
          useValue: mockPaymentRepository,
        },
        {
          provide: 'MercadoPagoPort',
          useValue: mockMercadoPagoAdapter,
        },
      ],
    }).compile();

    useCase = module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
  });

  describe('execute', () => {
    it('should create a PIX payment successfully', async () => {
      const dto = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
      };

      mockPaymentRepository.save.mockResolvedValue({
        id: 'test-id',
        ...dto,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
      expect(result.paymentMethod).toBe(PaymentMethod.PIX);
      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(mockPaymentRepository.save).toHaveBeenCalled();
      expect(mockMercadoPagoAdapter.createPreference).not.toHaveBeenCalled();
    });

    it('should create a CREDIT_CARD payment with external integration', async () => {
      const dto = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      mockMercadoPagoAdapter.createPreference.mockResolvedValue({
        id: 'external-id',
        init_point: 'https://payment-link.com',
        status: 'pending',
      });

      mockPaymentRepository.save.mockResolvedValue({
        id: 'test-id',
        ...dto,
        status: PaymentStatus.PENDING,
        externalId: 'external-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
      expect(result.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
      expect(result.externalId).toBe('external-id');
      expect(mockMercadoPagoAdapter.createPreference).toHaveBeenCalled();
      expect(mockPaymentRepository.save).toHaveBeenCalled();
    });

    it('should throw InvalidPaymentDataException for invalid CPF', async () => {
      const dto = {
        cpf: '123',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidPaymentDataException,
      );
    });

    it('should throw InvalidPaymentDataException for negative amount', async () => {
      const dto = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: -100.0,
        paymentMethod: PaymentMethod.PIX,
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidPaymentDataException,
      );
    });

    it('should throw ExternalPaymentException when Mercado Pago fails', async () => {
      const dto = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      mockMercadoPagoAdapter.createPreference.mockRejectedValue(
        new Error('API error'),
      );

      await expect(useCase.execute(dto)).rejects.toThrow(
        ExternalPaymentException,
      );
    });
  });
});