import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentModule } from './payment/payment.module'; // Update this path accordingly
import { PrismaService } from './infrastructure/adapters/database/prisma.service';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor'; // Update this path accordingly
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Configuração do ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      cache: true,
      expandVariables: true,
    }),

    // Rate limiting (proteção contra DDoS/abuso)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60000), // 1 minuto
          limit: config.get<number>('THROTTLE_LIMIT', 100), // 100 requests por minuto
        },
      ],
    }),

    // Módulos da aplicação
    PaymentModule,
    PrismaModule
  ],
  providers: [
    // Serviços globais
    PrismaService,

    // Pipes globais
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },

    // Filters globais
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Interceptors globais
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}