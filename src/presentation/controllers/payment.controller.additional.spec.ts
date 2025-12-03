import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '../../presentation/controllers/payment.controller';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { UpdatePaymentUseCase } from '../../application/use-cases/update-payment.use-case';
import { GetPaymentUseCase } from '../../application/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from '../../application/use-cases/list-payments.use-case';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentNotFoundException } from '../../domain/exceptions/payment.exception';

describe('PaymentController - Additional Tests', () => {
  let controller: PaymentController;
  let mockCreatePaymentUseCase: any;
  let mockUpdatePaymentUseCase: any;
  let mockGetPaymentUseCase: any;
  let mockListPaymentsUseCase: any;

  beforeEach(async () => {
    mockCreatePaymentUseCase = {
      execute: jest.fn(),
    };

    mockUpdatePaymentUseCase = {
      execute: jest.fn(),
    };

    mockGetPaymentUseCase = {
      execute: jest.fn(),
    };

    mockListPaymentsUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: CreatePaymentUseCase,
          useValue: mockCreatePaymentUseCase,
        },
        {
          provide: UpdatePaymentUseCase,
          useValue: mockUpdatePaymentUseCase,
        },
        {
          provide: GetPaymentUseCase,
          useValue: mockGetPaymentUseCase,
        },
        {
          provide: ListPaymentsUseCase,
          useValue: mockListPaymentsUseCase,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  describe('create - edge cases', () => {
    it('should handle decimal amounts correctly', async () => {
      const createDto = {
        cpf: '12345678901',
        description: 'Test payment with decimals',
        amount: 99.99,
        paymentMethod: PaymentMethod.PIX,
      };

      const mockPayment = {
        id: 'test-id',
        ...createDto,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreatePaymentUseCase.execute.mockResolvedValue(mockPayment);

      const result = await controller.create(createDto);

      expect(result).toBeDefined();
      expect(result.amount).toBe(99.99);
      expect(mockCreatePaymentUseCase.execute).toHaveBeenCalledWith({
        cpf: '12345678901',
        description: 'Test payment with decimals',
        amount: 99.99,
        paymentMethod: PaymentMethod.PIX,
      });
    });

    it('should handle long descriptions', async () => {
      const longDescription = 'A'.repeat(500);
      const createDto = {
        cpf: '12345678901',
        description: longDescription,
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
      };

      const mockPayment = {
        id: 'test-id',
        ...createDto,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreatePaymentUseCase.execute.mockResolvedValue(mockPayment);

      const result = await controller.create(createDto);

      expect(result).toBeDefined();
      expect(result.description).toBe(longDescription);
    });

    it('should handle CPF with zeros', async () => {
      const createDto = {
        cpf: '00000000000',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
      };

      const mockPayment = {
        id: 'test-id',
        ...createDto,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreatePaymentUseCase.execute.mockResolvedValue(mockPayment);

      const result = await controller.create(createDto);

      expect(result).toBeDefined();
      expect(result.cpf).toBe('00000000000');
    });
  });

  describe('update - edge cases', () => {
    it('should handle partial updates', async () => {
      mockUpdatePaymentUseCase.execute.mockResolvedValue(undefined);

      // Apenas status
      await controller.update('test-id', { status: PaymentStatus.PAID });
      expect(mockUpdatePaymentUseCase.execute).toHaveBeenCalledWith('test-id', {
        status: PaymentStatus.PAID,
      });

      // Apenas externalId
      mockUpdatePaymentUseCase.execute.mockClear();
      await controller.update('test-id', { externalId: 'ext-123' });
      expect(mockUpdatePaymentUseCase.execute).toHaveBeenCalledWith('test-id', {
        externalId: 'ext-123',
      });

      // Ambos
      mockUpdatePaymentUseCase.execute.mockClear();
      await controller.update('test-id', {
        status: PaymentStatus.FAIL,
        externalId: 'ext-456',
      });
      expect(mockUpdatePaymentUseCase.execute).toHaveBeenCalledWith('test-id', {
        status: PaymentStatus.FAIL,
        externalId: 'ext-456',
      });
    });

    it('should handle empty update object', async () => {
      mockUpdatePaymentUseCase.execute.mockResolvedValue(undefined);

      await controller.update('test-id', {});

      expect(mockUpdatePaymentUseCase.execute).toHaveBeenCalledWith('test-id', {});
    });

    it('should propagate PaymentNotFoundException', async () => {
      mockUpdatePaymentUseCase.execute.mockRejectedValue(
        new PaymentNotFoundException('non-existent-id'),
      );

      await expect(
        controller.update('non-existent-id', { status: PaymentStatus.PAID }),
      ).rejects.toThrow(PaymentNotFoundException);
    });
  });

  describe('findOne - edge cases', () => {
    it('should handle different ID formats', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const mockPayment = {
        id: uuid,
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetPaymentUseCase.execute.mockResolvedValue(mockPayment);

      const result = await controller.findOne(uuid);

      expect(result).toBeDefined();
      expect(result.id).toBe(uuid);
      expect(mockGetPaymentUseCase.execute).toHaveBeenCalledWith(uuid);
    });

    it('should return payment with externalId', async () => {
      const mockPayment = {
        id: 'test-id',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PAID,
        externalId: 'mp-preference-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetPaymentUseCase.execute.mockResolvedValue(mockPayment);

      const result = await controller.findOne('test-id');

      expect(result).toBeDefined();
      expect(result.externalId).toBe('mp-preference-123');
      expect(result.status).toBe(PaymentStatus.PAID);
    });
  });

  describe('findAll - edge cases', () => {
    it('should handle all query parameters combined', async () => {
      const mockPayments = [
        {
          id: 'test-id-1',
          cpf: '12345678901',
          description: 'Test payment',
          amount: 100.0,
          paymentMethod: PaymentMethod.PIX,
          status: PaymentStatus.PENDING,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
      ];

      mockListPaymentsUseCase.execute.mockResolvedValue(mockPayments);

      await controller.findAll(
        '12345678901',
        PaymentMethod.PIX,
        PaymentStatus.PENDING,
        '2024-01-01T00:00:00.000Z',
        '2024-01-31T23:59:59.999Z',
        '0',
        '50',
      );

      expect(mockListPaymentsUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          cpf: '12345678901',
          paymentMethod: PaymentMethod.PIX,
          status: PaymentStatus.PENDING,
          startDate: new Date('2024-01-01T00:00:00.000Z'),
          endDate: new Date('2024-01-31T23:59:59.999Z'),
          skip: 0,
          take: 50,
        }),
      );
    });

    it('should handle undefined query parameters', async () => {
      const mockPayments = [
        {
          id: 'test-id-1',
          cpf: '12345678901',
          description: 'Test payment',
          amount: 100.0,
          paymentMethod: PaymentMethod.PIX,
          status: PaymentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockListPaymentsUseCase.execute.mockResolvedValue(mockPayments);

      // Chamar com todos os parâmetros como undefined
      await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      expect(mockListPaymentsUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          cpf: undefined,
          paymentMethod: undefined,
          status: undefined,
          startDate: undefined,
          endDate: undefined,
          skip: undefined,
          take: undefined,
        }),
      );
    });

    it('should handle pagination parameters as strings', async () => {
      const mockPayments = [
        {
          id: 'test-id-1',
          cpf: '12345678901',
          description: 'Test payment',
          amount: 100.0,
          paymentMethod: PaymentMethod.PIX,
          status: PaymentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockListPaymentsUseCase.execute.mockResolvedValue(mockPayments);

      await controller.findAll(undefined, undefined, undefined, undefined, undefined, '10', '20');

      expect(mockListPaymentsUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 20,
        }),
      );
    });

    it('should handle empty result set', async () => {
      mockListPaymentsUseCase.execute.mockResolvedValue([]);

      const result = await controller.findAll('99999999999');

      expect(result).toEqual([]);
      expect(mockListPaymentsUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          cpf: '99999999999',
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should propagate exceptions from use cases', async () => {
      const error = new Error('Database connection failed');
      mockCreatePaymentUseCase.execute.mockRejectedValue(error);

      const createDto = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
      };

      await expect(controller.create(createDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle validation errors gracefully', async () => {
      // Simula erro de validação do class-validator
      const createDto = {
        cpf: '123', // CPF muito curto
        description: 'Test payment',
        amount: -100.0, // Valor negativo
        paymentMethod: 'INVALID_METHOD',
      };

      // Note: A validação real seria tratada pelo ValidationPipe
      // Aqui estamos testando que o controller passa os dados para o use case
      mockCreatePaymentUseCase.execute.mockRejectedValue(
        new Error('Validation failed'),
      );

      await expect(
        controller.create(createDto as any),
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('webhook endpoint', () => {
    it('should handle webhook notifications', async () => {
      const notification = {
        action: 'payment.created',
        data: { id: '123456789' },
        type: 'payment',
      };

      // O endpoint de webhook deve retornar 200 OK
      // Implementação básica - em produção, isso seria mais complexo
      const result = await controller.handleWebhook(notification);

      expect(result).toBeUndefined(); // Endpoint retorna void
    });

    it('should handle empty webhook payload', async () => {
      await expect(controller.handleWebhook({})).resolves.not.toThrow();
    });

    it('should handle malformed webhook data', async () => {
      const malformedNotification = {
        someInvalidField: 'value',
      };

      await expect(
        controller.handleWebhook(malformedNotification),
      ).resolves.not.toThrow();
    });
  });
});