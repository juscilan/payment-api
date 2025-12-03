import { PaymentFilterDto } from '../../application/dto/payment-filter.dto';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

describe('PaymentFilterDto', () => {

  describe('PaymentFilterDto', () => {
    it('should create instance with all filters', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const dto = new PaymentFilterDto(
        '12345678901',
        PaymentMethod.PIX,
        PaymentStatus.PENDING,
        startDate,
        endDate,
        10,
        20,
      );

      expect(dto.cpf).toBe('12345678901');
      expect(dto.paymentMethod).toBe(PaymentMethod.PIX);
      expect(dto.status).toBe(PaymentStatus.PENDING);
      expect(dto.startDate).toBe(startDate);
      expect(dto.endDate).toBe(endDate);
      expect(dto.skip).toBe(10);
      expect(dto.take).toBe(20);
    });

    it('should handle partial filters', () => {
      const dto = new PaymentFilterDto(
        '12345678901',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      expect(dto.cpf).toBe('12345678901');
      expect(dto.paymentMethod).toBeUndefined();
      expect(dto.status).toBeUndefined();
      expect(dto.startDate).toBeUndefined();
      expect(dto.endDate).toBeUndefined();
      expect(dto.skip).toBeUndefined();
      expect(dto.take).toBeUndefined();
    });

    it('should handle only pagination filters', () => {
      const dto = new PaymentFilterDto(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        0,
        50,
      );

      expect(dto.cpf).toBeUndefined();
      expect(dto.paymentMethod).toBeUndefined();
      expect(dto.status).toBeUndefined();
      expect(dto.skip).toBe(0);
      expect(dto.take).toBe(50);
    });
  });
});