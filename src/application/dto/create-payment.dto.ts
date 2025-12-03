import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class CreatePaymentDto {
  constructor(
    public readonly cpf: string,
    public readonly description: string,
    public readonly amount: number,
    public readonly paymentMethod: PaymentMethod,
  ) {}
}
