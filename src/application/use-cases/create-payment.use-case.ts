import { Inject, Injectable } from '@nestjs/common';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentRepositoryPort } from '../../domain/ports/repositories/payment.repository.port';
import { MercadoPagoPort } from '../../domain/ports/external/mercado-pago.port';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import {
  ExternalPaymentException,
  InvalidPaymentDataException,
} from '../../domain/exceptions/payment.exception';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject('PaymentRepositoryPort')
    private readonly paymentRepository: PaymentRepositoryPort,
    @Inject('MercadoPagoPort')
    private readonly mercadoPagoAdapter: MercadoPagoPort,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<Payment> {
    this.validatePaymentData(dto);

    let status = PaymentStatus.PENDING;
    let externalId: string | undefined;

    if (dto.paymentMethod === PaymentMethod.CREDIT_CARD) {
      try {
        const preference = await this.mercadoPagoAdapter.createPreference({
          amount: dto.amount,
          description: dto.description,
          cpf: dto.cpf,
          external_reference: crypto?.randomUUID() || 'mock',
        });
        externalId = preference.id;
      } catch (error) {
        throw new ExternalPaymentException(
          `Failed to create payment preference: ${error.message}`,
        );
      }
    }

    const payment = Payment.create({
      cpf: dto.cpf,
      description: dto.description,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      status,
      externalId,
      updateStatus: (newStatus: PaymentStatus) => { status = newStatus; },
      setExternalId: (id: string) => { externalId = id; },
    });

    return this.paymentRepository.save(payment);
  }

  private validatePaymentData(dto: CreatePaymentDto): void {
    if (!dto.cpf || dto.cpf.length !== 11) {
      throw new InvalidPaymentDataException('Invalid CPF');
    }

    if (!dto.description || dto.description.trim().length === 0) {
      throw new InvalidPaymentDataException('Description is required');
    }

    if (!dto.amount || dto.amount <= 0) {
      throw new InvalidPaymentDataException('Amount must be greater than zero');
    }

    if (!Object.values(PaymentMethod).includes(dto.paymentMethod)) {
      throw new InvalidPaymentDataException('Invalid payment method');
    }
  }
}
