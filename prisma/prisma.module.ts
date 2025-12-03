import { Global, Module } from '@nestjs/common';
// Ensure the file exists
import { PrismaService } from '../src/infrastructure/adapters/database/prisma.service'; // Check if this file is present

@Global() // Makes PrismaService available globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}