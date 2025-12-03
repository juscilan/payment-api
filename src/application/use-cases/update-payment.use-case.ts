import { Inject, Injectable } from '@nestjs/common';
import { PaymentRepositoryPort } from '../../domain/ports/repositories/payment.repository.port';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentNotFoundException } from '../../domain/exceptions/payment.exception';

@Injectable()
export class UpdatePaymentUseCase {
  constructor(
    @Inject('PaymentRepositoryPort')
    private readonly paymentRepository: PaymentRepositoryPort,
  ) {}

  async execute(id: string, dto: UpdatePaymentDto): Promise<void> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new PaymentNotFoundException(id);
    }

    if (dto.status) {
      payment.updateStatus(dto.status);
    }

    if (dto.externalId) {
      payment.setExternalId(dto.externalId);
    }

    await this.paymentRepository.update(payment);
  }
}
