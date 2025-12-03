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