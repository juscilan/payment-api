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

@Controller('payment')
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
  }
}