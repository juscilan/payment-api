import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { UpdatePaymentUseCase } from '../../application/use-cases/update-payment.use-case';
import { GetPaymentUseCase } from '../../application/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from '../../application/use-cases/list-payments.use-case';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

describe('PaymentController', () => {
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

  describe('create', () => {
    it('should create a payment', async () => {
      const createDto = {
        cpf: '12345678901',
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
      expect(result.id).toBe('test-id');
      expect(mockCreatePaymentUseCase.execute).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      const updateDto = {
        status: PaymentStatus.PAID,
      };

      mockUpdatePaymentUseCase.execute.mockResolvedValue(undefined);

      await controller.update('test-id', updateDto);

      expect(mockUpdatePaymentUseCase.execute).toHaveBeenCalledWith(
        'test-id',
        updateDto,
      );
    });
  });

  describe('findOne', () => {
    it('should return a payment', async () => {
      const mockPayment = {
        id: 'test-id',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetPaymentUseCase.execute.mockResolvedValue(mockPayment);

      const result = await controller.findOne('test-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      expect(mockGetPaymentUseCase.execute).toHaveBeenCalledWith('test-id');
    });
  });

  describe('findAll', () => {
    it('should return a list of payments', async () => {
      const mockPayments = [
        {
          id: 'test-id-1',
          cpf: '12345678901',
          description: 'Test payment 1',
          amount: 100.0,
          paymentMethod: PaymentMethod.PIX,
          status: PaymentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'test-id-2',
          cpf: '98765432109',
          description: 'Test payment 2',
          amount: 200.0,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.PAID,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockListPaymentsUseCase.execute.mockResolvedValue(mockPayments);

      const result = await controller.findAll(
        '12345678901',
        PaymentMethod.PIX,
        PaymentStatus.PENDING,
        '2024-01-01',
        '2024-12-31',
        '0',
        '10',
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(mockListPaymentsUseCase.execute).toHaveBeenCalled();
    });
  });
});