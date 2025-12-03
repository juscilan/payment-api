import { PaymentResponseDto } from '../../../presentation/dto/response/payment.response.dto';
import { Payment } from '../../../domain/entities/payment.entity';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';

describe('DTOs and Mappers', () => {
  describe('PaymentResponseDto', () => {
    it('should map from domain entity correctly', () => {
      const payment = new Payment(
        'test-id',
        '12345678901',
        'Test payment',
        100.0,
        PaymentMethod.CREDIT_CARD,
        PaymentStatus.PAID,
        'ext-123',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      const dto = PaymentResponseDto.fromDomain(payment);

      expect(dto.id).toBe('test-id');
      expect(dto.cpf).toBe('12345678901');
      expect(dto.description).toBe('Test payment');
      expect(dto.amount).toBe(100.0);
      expect(dto.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
      expect(dto.status).toBe(PaymentStatus.PAID);
      expect(dto.externalId).toBe('ext-123');
      expect(dto.createdAt).toEqual(new Date('2024-01-01'));
      expect(dto.updatedAt).toEqual(new Date('2024-01-02'));
    });

    it('should handle payment without externalId', () => {
      const payment = new Payment(
        'test-id',
        '12345678901',
        'Test payment',
        100.0,
        PaymentMethod.PIX,
        PaymentStatus.PENDING,
        undefined,
        new Date(),
        new Date(),
      );

      const dto = PaymentResponseDto.fromDomain(payment);

      expect(dto.externalId).toBeUndefined();
      expect(dto.paymentMethod).toBe(PaymentMethod.PIX);
      expect(dto.status).toBe(PaymentStatus.PENDING);
    });
  });
});