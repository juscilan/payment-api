import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class Payment {
  constructor(
    public id: string,
    public cpf: string,
    public description: string,
    public amount: number,
    public paymentMethod: PaymentMethod,
    public status: PaymentStatus,
    public externalId?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  static create(props: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
    return new Payment(
      crypto.randomUUID(),
      props.cpf,
      props.description,
      props.amount,
      props.paymentMethod,
      props.status,
      props.externalId,
      new Date(),
      new Date(),
    );
  }

  updateStatus(status: PaymentStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  setExternalId(externalId: string): void {
    this.externalId = externalId;
  }
}
