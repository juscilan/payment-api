import { Inject, Injectable } from '@nestjs/common';
import { PaymentRepositoryPort } from '../../domain/ports/repositories/payment.repository.port';
import { PaymentFilterDto } from '../dto/payment-filter.dto';
import { Payment } from '../../domain/entities/payment.entity';

@Injectable()
export class ListPaymentsUseCase {
  constructor(
    @Inject('PaymentRepositoryPort')
    private readonly paymentRepository: PaymentRepositoryPort,
  ) {}

  async execute(filter: PaymentFilterDto): Promise<Payment[]> {
    return this.paymentRepository.findAll(filter);
  }
}
