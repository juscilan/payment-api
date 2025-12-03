import { Payment } from '../../entities/payment.entity'; // Adjusted path based on project structure
import { PaymentFilterDto } from '../../../application/dto/payment-filter.dto'; // Adjusted path based on project structure

export interface PaymentRepositoryPort {
  save(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findAll(filter: PaymentFilterDto): Promise<Payment[]>;
}
