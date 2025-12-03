import { Module } from '@nestjs/common';
import { PaymentController } from './presentation/controllers/payment.controller';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { UpdatePaymentUseCase } from './application/use-cases/update-payment.use-case';
import { GetPaymentUseCase } from './application/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from './application/use-cases/list-payments.use-case';
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { MercadoPagoAdapter } from './infrastructure/adapters/mercado-pago/mercado-pago.adapter';
import { PrismaService } from './infrastructure/adapters/database/prisma.service'; // Updated path

@Module({
  controllers: [PaymentController],
  providers: [
    PrismaService,
    {
      provide: 'PaymentRepositoryPort',
      useClass: PaymentRepository,
    },
    {
      provide: 'MercadoPagoPort',
      useClass: MercadoPagoAdapter,
    },
    CreatePaymentUseCase,
    UpdatePaymentUseCase,
    GetPaymentUseCase,
    ListPaymentsUseCase,
  ],
})
export class PaymentModule {}