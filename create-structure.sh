#!/bin/bash

# Script para criar a estrutura completa do projeto Payment API
# Uso: ./create-structure.sh

set -e  # Sai em caso de erro

echo "🚀 Iniciando criação da estrutura do projeto Payment API..."

# Verifica se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto NestJS"
    exit 1
fi

# Cria diretórios
echo "📁 Criando diretórios..."

# Camada de Domínio
mkdir -p src/domain/{entities,enums,exceptions,ports/{repositories,external}}

# Camada de Aplicação
mkdir -p src/application/{use-cases,dto}

# Camada de Infraestrutura
mkdir -p src/infrastructure/{adapters/{mercado-pago,database/{prisma}},repositories}

# Camada de Apresentação
mkdir -p src/presentation/{controllers,dto/{request,response},middleware}

# Diretório de Testes
mkdir -p test

echo "✅ Diretórios criados com sucesso!"

# 1. CAMADA DE DOMÍNIO

# 1.1 Payment Entity
echo "📝 Criando src/domain/entities/payment.entity.ts..."
cat > src/domain/entities/payment.entity.ts << 'EOF'
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
EOF

# 1.2 Payment Method Enum
echo "📝 Criando src/domain/enums/payment-method.enum.ts..."
cat > src/domain/enums/payment-method.enum.ts << 'EOF'
export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
}
EOF

# 1.3 Payment Status Enum
echo "📝 Criando src/domain/enums/payment-status.enum.ts..."
cat > src/domain/enums/payment-status.enum.ts << 'EOF'
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAIL = 'FAIL',
}
EOF

# 1.4 Payment Exception
echo "📝 Criando src/domain/exceptions/payment.exception.ts..."
cat > src/domain/exceptions/payment.exception.ts << 'EOF'
export class PaymentException extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'PaymentException';
  }
}

export class PaymentNotFoundException extends PaymentException {
  constructor(id: string) {
    super(`Payment with id ${id} not found`, 'PAYMENT_NOT_FOUND');
  }
}

export class InvalidPaymentDataException extends PaymentException {
  constructor(message: string) {
    super(message, 'INVALID_PAYMENT_DATA');
  }
}

export class ExternalPaymentException extends PaymentException {
  constructor(message: string) {
    super(message, 'EXTERNAL_PAYMENT_ERROR');
  }
}
EOF

# 1.5 Payment Repository Port
echo "📝 Criando src/domain/ports/repositories/payment.repository.port.ts..."
cat > src/domain/ports/repositories/payment.repository.port.ts << 'EOF'
import { Payment } from '../../../entities/payment.entity';
import { PaymentFilterDto } from '../../../../application/dto/payment-filter.dto';

export interface PaymentRepositoryPort {
  save(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findAll(filter: PaymentFilterDto): Promise<Payment[]>;
}
EOF

# 1.6 Mercado Pago Port
echo "📝 Criando src/domain/ports/external/mercado-pago.port.ts..."
cat > src/domain/ports/external/mercado-pago.port.ts << 'EOF'
export interface CreatePreferenceRequest {
  amount: number;
  description: string;
  cpf: string;
  external_reference: string;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  status: string;
}

export interface WebhookNotification {
  action: string;
  api_version: string;
  data: { id: string };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

export interface MercadoPagoPort {
  createPreference(request: CreatePreferenceRequest): Promise<PreferenceResponse>;
  getPaymentStatus(paymentId: string): Promise<string>;
}
EOF

# 2. CAMADA DE APLICAÇÃO

# 2.1 Create Payment DTO
echo "📝 Criando src/application/dto/create-payment.dto.ts..."
cat > src/application/dto/create-payment.dto.ts << 'EOF'
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class CreatePaymentDto {
  constructor(
    public readonly cpf: string,
    public readonly description: string,
    public readonly amount: number,
    public readonly paymentMethod: PaymentMethod,
  ) {}
}
EOF

# 2.2 Update Payment DTO
echo "📝 Criando src/application/dto/update-payment.dto.ts..."
cat > src/application/dto/update-payment.dto.ts << 'EOF'
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

export class UpdatePaymentDto {
  constructor(
    public readonly status?: PaymentStatus,
    public readonly externalId?: string,
  ) {}
}
EOF

# 2.3 Payment Filter DTO
echo "📝 Criando src/application/dto/payment-filter.dto.ts..."
cat > src/application/dto/payment-filter.dto.ts << 'EOF'
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
EOF

# 2.4 Create Payment Use Case
echo "📝 Criando src/application/use-cases/create-payment.use-case.ts..."
cat > src/application/use-cases/create-payment.use-case.ts << 'EOF'
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
          external_reference: crypto.randomUUID(),
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
EOF

# 2.5 Update Payment Use Case
echo "📝 Criando src/application/use-cases/update-payment.use-case.ts..."
cat > src/application/use-cases/update-payment.use-case.ts << 'EOF'
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
EOF

# 2.6 Get Payment Use Case
echo "📝 Criando src/application/use-cases/get-payment.use-case.ts..."
cat > src/application/use-cases/get-payment.use-case.ts << 'EOF'
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
EOF

# 2.7 List Payments Use Case
echo "📝 Criando src/application/use-cases/list-payments.use-case.ts..."
cat > src/application/use-cases/list-payments.use-case.ts << 'EOF'
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
EOF

# 3. CAMADA DE INFRAESTRUTURA

# 3.1 Mercado Pago Adapter
echo "📝 Criando src/infrastructure/adapters/mercado-pago/mercado-pago.adapter.ts..."
cat > src/infrastructure/adapters/mercado-pago/mercado-pago.adapter.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  MercadoPagoPort,
  CreatePreferenceRequest,
  PreferenceResponse,
} from '../../../domain/ports/external/mercado-pago.port';

@Injectable()
export class MercadoPagoAdapter implements MercadoPagoPort {
  private readonly baseUrl = 'https://api.mercadopago.com';
  private readonly accessToken: string;

  constructor() {
    this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
  }

  async createPreference(request: CreatePreferenceRequest): Promise<PreferenceResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/checkout/preferences`,
        {
          items: [
            {
              title: request.description,
              quantity: 1,
              currency_id: 'BRL',
              unit_price: request.amount,
            },
          ],
          payer: {
            identification: {
              type: 'CPF',
              number: request.cpf,
            },
          },
          external_reference: request.external_reference,
          notification_url: `${process.env.APP_URL}/api/payment/webhook`,
          back_urls: {
            success: `${process.env.FRONTEND_URL}/success`,
            failure: `${process.env.FRONTEND_URL}/failure`,
          },
          auto_return: 'approved',
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        id: response.data.id,
        init_point: response.data.init_point,
        status: response.data.status,
      };
    } catch (error) {
      throw new Error(`Mercado Pago API error: ${error.message}`);
    }
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      return response.data.status;
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }
}
EOF

# 3.2 Mercado Pago DTO
echo "📝 Criando src/infrastructure/adapters/mercado-pago/mercado-pago.dto.ts..."
cat > src/infrastructure/adapters/mercado-pago/mercado-pago.dto.ts << 'EOF'
// DTOs específicos para a integração com Mercado Pago
export interface MercadoPagoPreferenceRequest {
  items: Array<{
    title: string;
    quantity: number;
    currency_id: string;
    unit_price: number;
  }>;
  payer: {
    identification: {
      type: string;
      number: string;
    };
  };
  external_reference: string;
  notification_url: string;
  back_urls: {
    success: string;
    failure: string;
  };
  auto_return: string;
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  date_created: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
}

export interface MercadoPagoPaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  date_approved?: string;
  date_created: string;
  description: string;
  transaction_amount: number;
}
EOF

# 3.3 Payment Repository
echo "📝 Criando src/infrastructure/repositories/payment.repository.ts..."
cat > src/infrastructure/repositories/payment.repository.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../adapters/database/prisma/prisma.service';
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
EOF

# 3.4 Prisma Service
echo "📝 Criando src/infrastructure/adapters/database/prisma/prisma.service.ts..."
cat > src/infrastructure/adapters/database/prisma/prisma.service.ts << 'EOF'
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
EOF

# 4. CAMADA DE APRESENTAÇÃO

# 4.1 Payment Controller
echo "📝 Criando src/presentation/controllers/payment.controller.ts..."
cat > src/presentation/controllers/payment.controller.ts << 'EOF'
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { UpdatePaymentUseCase } from '../../application/use-cases/update-payment.use-case';
import { GetPaymentUseCase } from '../../application/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from '../../application/use-cases/list-payments.use-case';
import { CreatePaymentRequestDto } from '../dto/request/create-payment.request.dto';
import { UpdatePaymentRequestDto } from '../dto/request/update-payment.request.dto';
import { PaymentResponseDto } from '../dto/response/payment.response.dto';
import { PaymentFilterDto } from '../../application/dto/payment-filter.dto';

@Controller('api/payment')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createPaymentDto: CreatePaymentRequestDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.createPaymentUseCase.execute({
      cpf: createPaymentDto.cpf,
      description: createPaymentDto.description,
      amount: createPaymentDto.amount,
      paymentMethod: createPaymentDto.paymentMethod,
    });

    return PaymentResponseDto.fromDomain(payment);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentRequestDto,
  ): Promise<void> {
    await this.updatePaymentUseCase.execute(id, {
      status: updatePaymentDto.status,
      externalId: updatePaymentDto.externalId,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    const payment = await this.getPaymentUseCase.execute(id);
    return PaymentResponseDto.fromDomain(payment);
  }

  @Get()
  async findAll(
    @Query('cpf') cpf?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<PaymentResponseDto[]> {
    const filter = new PaymentFilterDto(
      cpf,
      paymentMethod as any,
      status as any,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
    );

    const payments = await this.listPaymentsUseCase.execute(filter);
    return payments.map(PaymentResponseDto.fromDomain);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() notification: any): Promise<void> {
    // Implementar lógica de webhook do Mercado Pago
    // Extrair paymentId da notificação e atualizar status
    console.log('Webhook received:', notification);
  }
}
EOF

# 4.2 Create Payment Request DTO
echo "📝 Criando src/presentation/dto/request/create-payment.request.dto.ts..."
cat > src/presentation/dto/request/create-payment.request.dto.ts << 'EOF'
import { IsEnum, IsNotEmpty, IsNumber, IsString, Length, Min } from 'class-validator';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';

export class CreatePaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  cpf: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
EOF

# 4.3 Update Payment Request DTO
echo "📝 Criando src/presentation/dto/request/update-payment.request.dto.ts..."
cat > src/presentation/dto/request/update-payment.request.dto.ts << 'EOF'
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';

export class UpdatePaymentRequestDto {
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  externalId?: string;
}
EOF

# 4.4 Payment Response DTO
echo "📝 Criando src/presentation/dto/response/payment.response.dto.ts..."
cat > src/presentation/dto/response/payment.response.dto.ts << 'EOF'
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
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
EOF

# 5. CRIAR ARQUIVOS ADICIONAIS NECESSÁRIOS

# 5.1 Payment Module
echo "📝 Criando src/payment/payment.module.ts..."
cat > src/payment/payment.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from '../presentation/controllers/payment.controller';
import { CreatePaymentUseCase } from '../application/use-cases/create-payment.use-case';
import { UpdatePaymentUseCase } from '../application/use-cases/update-payment.use-case';
import { GetPaymentUseCase } from '../application/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from '../application/use-cases/list-payments.use-case';
import { PaymentRepository } from '../infrastructure/repositories/payment.repository';
import { MercadoPagoAdapter } from '../infrastructure/adapters/mercado-pago/mercado-pago.adapter';
import { PrismaService } from '../infrastructure/adapters/database/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
  ],
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
EOF

# 5.2 Main.ts atualizado
echo "📝 Atualizando src/main.ts..."
cat > src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule);
  
  // Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Prefixo global para API
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
EOF

# 5.3 Criar arquivo index.ts para exportação
echo "📝 Criando src/index.ts..."
cat > src/index.ts << 'EOF'
// Barrel file para exportações
export * from './domain/entities/payment.entity';
export * from './domain/enums/payment-method.enum';
export * from './domain/enums/payment-status.enum';
export * from './domain/exceptions/payment.exception';
EOF

# 6. CRIAR ARQUIVOS DE TESTE

echo "📁 Criando arquivos de teste..."

# 6.1 Setup de testes
cat > test/setup.ts << 'EOF'
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente de teste
dotenv.config({ path: '.env.test' });

// Mock global para crypto.randomUUID()
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => 'mocked-uuid-' + Math.random().toString(36).substr(2, 9),
  } as any;
}

// Configura timeout padrão para testes
jest.setTimeout(10000);

// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
EOF

# 6.2 Teste da entidade Payment
cat > test/payment.entity.spec.ts << 'EOF'
import { Payment } from '../src/domain/entities/payment.entity';
import { PaymentMethod } from '../src/domain/enums/payment-method.enum';
import { PaymentStatus } from '../src/domain/enums/payment-status.enum';

describe('Payment Entity', () => {
  describe('create', () => {
    it('should create a new payment with generated ID and timestamps', () => {
      const paymentProps = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
      };

      const payment = Payment.create(paymentProps);

      expect(payment.id).toBeDefined();
      expect(payment.cpf).toBe(paymentProps.cpf);
      expect(payment.description).toBe(paymentProps.description);
      expect(payment.amount).toBe(paymentProps.amount);
      expect(payment.paymentMethod).toBe(paymentProps.paymentMethod);
      expect(payment.status).toBe(paymentProps.status);
      expect(payment.createdAt).toBeInstanceOf(Date);
      expect(payment.updatedAt).toBeInstanceOf(Date);
    });

    it('should create payment with externalId', () => {
      const paymentProps = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.0,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING,
        externalId: 'external-123',
      };

      const payment = Payment.create(paymentProps);

      expect(payment.externalId).toBe(paymentProps.externalId);
    });
  });

  describe('updateStatus', () => {
    it('should update payment status', () => {
      const payment = new Payment(
        'test-id',
        '12345678901',
        'Test payment',
        100.0,
        PaymentMethod.PIX,
        PaymentStatus.PENDING,
        undefined,
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );

      const oldUpdatedAt = payment.updatedAt;
      
      payment.updateStatus(PaymentStatus.PAID);

      expect(payment.status).toBe(PaymentStatus.PAID);
      expect(payment.updatedAt).not.toBe(oldUpdatedAt);
      expect(payment.updatedAt.getTime()).toBeGreaterThan(
        oldUpdatedAt.getTime(),
      );
    });
  });

  describe('setExternalId', () => {
    it('should set externalId for payment', () => {
      const payment = new Payment(
        'test-id',
        '12345678901',
        'Test payment',
        100.0,
        PaymentMethod.CREDIT_CARD,
        PaymentStatus.PENDING,
      );

      payment.setExternalId('external-123');

      expect(payment.externalId).toBe('external-123');
    });
  });
});
EOF

echo "🎉 Estrutura criada com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Instale as dependências: npm install"
echo "2. Configure o banco de dados: npm run db:up"
echo "3. Rode as migrations: npx prisma migrate dev"
echo "4. Gere o cliente Prisma: npx prisma generate"
echo "5. Inicie o servidor: npm run start:dev"
echo ""
echo "📚 Documentação da API estará disponível em: http://localhost:3000/api"