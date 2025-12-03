import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/adapters/database/prisma.service'; // Ensure this path is correct

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {
    console.log('PaymentService constructor called');
  }

  async createPayment(data: any) {
    return this.prisma.payment.create({
      data,
    });
  }
}