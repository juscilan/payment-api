import { Test, TestingModule } from '@nestjs/testing';
import { GetPaymentUseCase } from '../../application/use-cases/get-payment.use-case';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentNotFoundException } from '../../domain/exceptions/payment.exception';

describe('GetPaymentUseCase', () => {
  let useCase: GetPaymentUseCase;
  let mockPaymentRepository: any;

  beforeEach(async () => {
    mockPaymentRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPaymentUseCase,
        {
          provide: 'PaymentRepositoryPort',
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetPaymentUseCase>(GetPaymentUseCase);
  });

  describe('execute', () => {
    it('should return payment when found', async () => {
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

      mockPaymentRepository.findById.mockResolvedValue(mockPayment);

      const result = await useCase.execute('test-id');

      expect(result).toEqual(mockPayment);
      expect(mockPaymentRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw PaymentNotFoundException when payment not found', async () => {
      mockPaymentRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        PaymentNotFoundException,
      );
    });

    it('should handle database errors gracefully', async () => {
      mockPaymentRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(useCase.execute('test-id')).rejects.toThrow('Database error');
    });
  });
});