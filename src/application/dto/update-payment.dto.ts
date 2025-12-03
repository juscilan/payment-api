import { PaymentStatus } from '../../domain/enums/payment-status.enum';

export class UpdatePaymentDto {
  constructor(
    public readonly status?: PaymentStatus,
    public readonly externalId?: string,
  ) {}
}
