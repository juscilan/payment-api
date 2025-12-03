import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePaymentUseCase } from '../../application/use-cases/update-payment.use-case';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentNotFoundException } from '../../domain/exceptions/payment.exception';

describe('UpdatePaymentUseCase', () => {
  let useCase: UpdatePaymentUseCase;
  let mockPaymentRepository: any;

  beforeEach(async () => {
    mockPaymentRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePaymentUseCase,
        {
          provide: 'PaymentRepositoryPort',
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdatePaymentUseCase>(UpdatePaymentUseCase);
  });

  describe('execute', () => {
    it('should update payment status successfully', async () => {
      const mockPayment = {
        id: 'test-id',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: 'PIX',
        status: PaymentStatus.PENDING,
        updateStatus: jest.fn(),
        setExternalId: jest.fn(),
      };

      mockPaymentRepository.findById.mockResolvedValue(mockPayment);
      mockPaymentRepository.update.mockResolvedValue(mockPayment);

      await useCase.execute('test-id', {
        status: PaymentStatus.PAID,
      });

      expect(mockPayment.updateStatus).toHaveBeenCalledWith(PaymentStatus.PAID);
      expect(mockPaymentRepository.update).toHaveBeenCalledWith(mockPayment);
    });

    it('should update externalId successfully', async () => {
      const mockPayment = {
        id: 'test-id',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: 'CREDIT_CARD',
        status: PaymentStatus.PENDING,
        updateStatus: jest.fn(),
        setExternalId: jest.fn(),
      };

      mockPaymentRepository.findById.mockResolvedValue(mockPayment);
      mockPaymentRepository.update.mockResolvedValue(mockPayment);

      await useCase.execute('test-id', {
        externalId: 'external-123',
      });

      expect(mockPayment.setExternalId).toHaveBeenCalledWith('external-123');
      expect(mockPaymentRepository.update).toHaveBeenCalledWith(mockPayment);
    });

    it('should update both status and externalId', async () => {
      const mockPayment = {
        id: 'test-id',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: 'CREDIT_CARD',
        status: PaymentStatus.PENDING,
        updateStatus: jest.fn(),
        setExternalId: jest.fn(),
      };

      mockPaymentRepository.findById.mockResolvedValue(mockPayment);
      mockPaymentRepository.update.mockResolvedValue(mockPayment);

      await useCase.execute('test-id', {
        status: PaymentStatus.PAID,
        externalId: 'external-123',
      });

      expect(mockPayment.updateStatus).toHaveBeenCalledWith(PaymentStatus.PAID);
      expect(mockPayment.setExternalId).toHaveBeenCalledWith('external-123');
      expect(mockPaymentRepository.update).toHaveBeenCalledWith(mockPayment);
    });

    it('should throw PaymentNotFoundException when payment not found', async () => {
      mockPaymentRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id', {
          status: PaymentStatus.PAID,
        }),
      ).rejects.toThrow(PaymentNotFoundException);
    });

    it('should not call update if no fields to update', async () => {
      const mockPayment = {
        id: 'test-id',
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: 'PIX',
        status: PaymentStatus.PENDING,
        updateStatus: jest.fn(),
        setExternalId: jest.fn(),
      };

      mockPaymentRepository.findById.mockResolvedValue(mockPayment);

      await useCase.execute('test-id', {});

      expect(mockPayment.updateStatus).not.toHaveBeenCalled();
      expect(mockPayment.setExternalId).not.toHaveBeenCalled();
      expect(mockPaymentRepository.update).toHaveBeenCalledWith(mockPayment);
    });
  });
});