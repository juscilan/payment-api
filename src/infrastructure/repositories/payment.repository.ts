import { Injectable } from '@nestjs/common';
import { PrismaService } from '../adapters/database/prisma.service';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentRepositoryPort } from '../../domain/ports/repositories/payment.repository.port';
import { PaymentFilterDto } from '../../application/dto/payment-filter.dto';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

@Injectable()
export class PaymentRepository implements PaymentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(payment: Payment): Promise<Payment> {
    const savedPayment = await this.prisma.payment.create({
      data: {
        id: payment.id,
        cpf: payment.cpf,
        description: payment.description,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        externalId: payment.externalId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
    });

    return this.mapToDomain(savedPayment);
  }

  async update(payment: Payment): Promise<Payment> {
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: payment.status,
        externalId: payment.externalId,
        updatedAt: payment.updatedAt,
      },
    });

    return this.mapToDomain(updatedPayment);
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    return payment ? this.mapToDomain(payment) : null;
  }

  async findAll(filter: PaymentFilterDto): Promise<Payment[]> {
    const where: any = {};

    if (filter.cpf) {
      where.cpf = filter.cpf;
    }

    if (filter.paymentMethod) {
      where.paymentMethod = filter.paymentMethod;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = filter.startDate;
      if (filter.endDate) where.createdAt.lte = filter.endDate;
    }

    const payments = await this.prisma.payment.findMany({
      where,
      skip: filter.skip,
      take: filter.take,
      orderBy: { createdAt: 'desc' },
    });

    return payments.map(this.mapToDomain);
  }

  private mapToDomain(data: any): Payment {
    return new Payment(
      data.id,
      data.cpf,
      data.description,
      Number(data.amount),
      data.paymentMethod as PaymentMethod,
      data.status as PaymentStatus,
      data.externalId || undefined,
      data.createdAt,
      data.updatedAt,
    );
  }
}
