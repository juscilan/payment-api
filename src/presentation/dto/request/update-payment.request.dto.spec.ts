import { CreatePaymentRequestDto } from '../../../presentation/dto/request/create-payment.request.dto';
import { UpdatePaymentRequestDto } from '../../../presentation/dto/request/update-payment.request.dto';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';

describe('CreatePaymentRequestDto', () => {
  describe('CreatePaymentRequestDto', () => {
    it('should create instance with correct properties', () => {
      const dto = new CreatePaymentRequestDto();
      dto.cpf = '12345678901';
      dto.description = 'Test payment';
      dto.amount = 100.0;
      dto.paymentMethod = PaymentMethod.PIX;

      expect(dto.cpf).toBe('12345678901');
      expect(dto.description).toBe('Test payment');
      expect(dto.amount).toBe(100.0);
      expect(dto.paymentMethod).toBe(PaymentMethod.PIX);
    });
  });

  describe('UpdatePaymentRequestDto', () => {
    it('should create instance with optional properties', () => {
      const dto = new UpdatePaymentRequestDto();
      dto.status = PaymentStatus.PAID;
      dto.externalId = 'ext-123';

      expect(dto.status).toBe(PaymentStatus.PAID);
      expect(dto.externalId).toBe('ext-123');
    });

    it('should allow partial updates', () => {
      const dto = new UpdatePaymentRequestDto();
      // Apenas status
      dto.status = PaymentStatus.FAIL;

      expect(dto.status).toBe(PaymentStatus.FAIL);
      expect(dto.externalId).toBeUndefined();
    });
  });

});