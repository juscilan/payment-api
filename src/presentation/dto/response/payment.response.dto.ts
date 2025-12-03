import { Payment } from '../../../domain/entities/payment.entity';

export class PaymentResponseDto {
  id: string;
  cpf: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      cpf: payment.cpf,
      description: payment.description,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      externalId: payment.externalId,
      createdAt: payment.createdAt || new Date(), // Default to current date if undefined
      updatedAt: payment.updatedAt || new Date(), // Default to current date if undefined
    };
  }
}