import { UpdatePaymentDto } from '../../application/dto/update-payment.dto';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

describe('DTOs and Mappers', () => {
  describe('UpdatePaymentDto', () => {
    it('should create instance with optional fields', () => {
      const dto = new UpdatePaymentDto(
        PaymentStatus.PAID,
        'ext-123',
      );

      expect(dto.status).toBe(PaymentStatus.PAID);
      expect(dto.externalId).toBe('ext-123');
    });

    it('should allow status only updates', () => {
      const dto = new UpdatePaymentDto(PaymentStatus.FAIL);

      expect(dto.status).toBe(PaymentStatus.FAIL);
      expect(dto.externalId).toBeUndefined();
    });

    it('should allow externalId only updates', () => {
      const dto = new UpdatePaymentDto(undefined, 'ext-456');

      expect(dto.status).toBeUndefined();
      expect(dto.externalId).toBe('ext-456');
    });
  });
});