import { CreatePaymentDto } from '../../application/dto/create-payment.dto';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

describe('DTOs and Mappers', () => {
  describe('CreatePaymentDto', () => {
    it('should create instance from raw data', () => {
      const dto = new CreatePaymentDto(
        '12345678901',
        'Test payment',
        100.0,
        PaymentMethod.PIX,
      );

      expect(dto.cpf).toBe('12345678901');
      expect(dto.description).toBe('Test payment');
      expect(dto.amount).toBe(100.0);
      expect(dto.paymentMethod).toBe(PaymentMethod.PIX);
    });
  });
});