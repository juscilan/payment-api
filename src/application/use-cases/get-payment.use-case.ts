import { Inject, Injectable } from '@nestjs/common';
import { PaymentRepositoryPort } from '../../domain/ports/repositories/payment.repository.port';
import { PaymentNotFoundException } from '../../domain/exceptions/payment.exception';
import { Payment } from '../../domain/entities/payment.entity';

@Injectable()
export class GetPaymentUseCase {
  constructor(
    @Inject('PaymentRepositoryPort')
    private readonly paymentRepository: PaymentRepositoryPort,
  ) {}

  async execute(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new PaymentNotFoundException(id);
    }

    return payment;
  }
}
