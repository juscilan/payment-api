import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

export class PaymentFilterDto {
  constructor(
    public readonly cpf?: string,
    public readonly paymentMethod?: PaymentMethod,
    public readonly status?: PaymentStatus,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
