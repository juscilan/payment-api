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