import { Test, TestingModule } from '@nestjs/testing';
import { ListPaymentsUseCase } from '../../application/use-cases/list-payments.use-case';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

describe('ListPaymentsUseCase', () => {
  let useCase: ListPaymentsUseCase;
  let mockPaymentRepository: any;

  beforeEach(async () => {
    mockPaymentRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPaymentsUseCase,
        {
          provide: 'PaymentRepositoryPort',
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListPaymentsUseCase>(ListPaymentsUseCase);
  });

  describe('execute', () => {
    it('should return list of payments without filters', async () => {
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

      mockPaymentRepository.findAll.mockResolvedValue(mockPayments);

      const result = await useCase.execute({});

      expect(result).toEqual(mockPayments);
      expect(mockPaymentRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should filter by CPF', async () => {
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

      mockPaymentRepository.findAll.mockResolvedValue(mockPayments);

      const filter = {
        cpf: '12345678901',
      };

      const result = await useCase.execute(filter);

      expect(result).toEqual(mockPayments);
      expect(mockPaymentRepository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should filter by payment method', async () => {
      const mockPayments = [
        {
          id: 'test-id-2',
          cpf: '98765432109',
          description: 'Test payment',
          amount: 200.0,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.PAID,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPaymentRepository.findAll.mockResolvedValue(mockPayments);

      const filter = {
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      const result = await useCase.execute(filter);

      expect(result).toEqual(mockPayments);
      expect(mockPaymentRepository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should filter by status', async () => {
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

      mockPaymentRepository.findAll.mockResolvedValue(mockPayments);

      const filter = {
        status: PaymentStatus.PENDING,
      };

      const result = await useCase.execute(filter);

      expect(result).toEqual(mockPayments);
      expect(mockPaymentRepository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should filter by date range', async () => {
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

      mockPaymentRepository.findAll.mockResolvedValue(mockPayments);

      const filter = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      const result = await useCase.execute(filter);

      expect(result).toEqual(mockPayments);
      expect(mockPaymentRepository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should apply pagination', async () => {
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

      mockPaymentRepository.findAll.mockResolvedValue(mockPayments);

      const filter = {
        skip: 10,
        take: 10,
      };

      const result = await useCase.execute(filter);

      expect(result).toEqual(mockPayments);
      expect(mockPaymentRepository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should handle empty results', async () => {
      mockPaymentRepository.findAll.mockResolvedValue([]);

      const filter = {
        cpf: '00000000000',
      };

      const result = await useCase.execute(filter);

      expect(result).toEqual([]);
      expect(mockPaymentRepository.findAll).toHaveBeenCalledWith(filter);
    });
  });
});