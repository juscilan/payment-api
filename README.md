# Payment API

API to manage payments (PIX and Credit Card) built with NestJS, Prisma and a Mercado Pago adapter.

## Quick links
- App bootstrap: [`bootstrap`](src/main.ts) — [src/main.ts](src/main.ts)  
- Root module: [`AppModule`](src/app.module.ts) — [src/app.module.ts](src/app.module.ts)  
- Feature module: [`PaymentModule`](src/payment/payment.module.ts) — [src/payment/payment.module.ts](src/payment/payment.module.ts)  
- Prisma service: [`PrismaService`](src/infrastructure/adapters/database/prisma.service.ts) — [src/infrastructure/adapters/database/prisma.service.ts](src/infrastructure/adapters/database/prisma.service.ts)  
- Domain entity: [`Payment`](src/domain/entities/payment.entity.ts) — [src/domain/entities/payment.entity.ts](src/domain/entities/payment.entity.ts)  
- Controller: [`PaymentController`](src/presentation/controllers/payment.controller.ts) — [src/presentation/controllers/payment.controller.ts](src/presentation/controllers/payment.controller.ts)  
- Use cases:
  - [`CreatePaymentUseCase`](src/application/use-cases/create-payment.use-case.ts) — [src/application/use-cases/create-payment.use-case.ts](src/application/use-cases/create-payment.use-case.ts)  
  - [`UpdatePaymentUseCase`](src/application/use-cases/update-payment.use-case.ts) — [src/application/use-cases/update-payment.use-case.ts](src/application/use-cases/update-payment.use-case.ts)  
  - [`GetPaymentUseCase`](src/application/use-cases/get-payment.use-case.ts) — [src/application/use-cases/get-payment.use-case.ts](src/application/use-cases/get-payment.use-case.ts)  
  - [`ListPaymentsUseCase`](src/application/use-cases/list-payments.use-case.ts) — [src/application/use-cases/list-payments.use-case.ts](src/application/use-cases/list-payments.use-case.ts)  
- Repository: [`PaymentRepository`](src/infrastructure/repositories/payment.repository.ts) — [src/infrastructure/repositories/payment.repository.ts](src/infrastructure/repositories/payment.repository.ts)  
- External port / adapter:
  - Port: [`MercadoPagoPort`](src/domain/ports/external/mercado-pago.port.ts) — [src/domain/ports/external/mercado-pago.port.ts](src/domain/ports/external/mercado-pago.port.ts)  
  - Adapter: [`MercadoPagoAdapter`](src/infrastructure/adapters/mercado-pago/mercado-pago.adapter.ts) — [src/infrastructure/adapters/mercado-pago/mercado-pago.adapter.ts](src/infrastructure/adapters/mercado-pago/mercado-pago.adapter.ts)  
- DTOs and validation examples:
  - [`CreatePaymentDto`](src/application/dto/create-payment.dto.ts) — [src/application/dto/create-payment.dto.ts](src/application/dto/create-payment.dto.ts)  
  - Request DTO: [src/presentation/dto/request/create-payment.request.dto.ts](src/presentation/dto/request/create-payment.request.dto.ts)  
  - Response DTO: [src/presentation/dto/response/payment.response.dto.ts](src/presentation/dto/response/payment.response.dto.ts)  
- Prisma schema and migrations: [prisma/schema.prisma](prisma/schema.prisma), migrations in [prisma/migrations](prisma/migrations)  
- Project scripts and dependencies: [package.json](package.json)

## Features
- Clean architecture: domain, application, infrastructure, presentation layers.
- Persistence via Prisma and PostgreSQL.
- Mercado Pago integration adapter (create preference, check payment status).
- Input validation (class-validator) and global pipes/filters/interceptors.
- Unit tests with Jest and e2e scaffolding.

## Getting started

Prerequisites
- Node.js (>= 24)
- Aplly nvm use (the project contains nvmrc file on root)
- PostgreSQL (or use Docker Compose included)

1. Install dependencies
```sh
npm install
```

2. Configure environment
- Copy and edit: [`.env`](.env) and [`.env.test`](.env.test)

3. Start PostgreSQL (Docker)
```sh
docker-compose up -d
```

4. Run Prisma migrations & generate client
```sh
npx prisma migrate dev
npx prisma generate
```

5. (Optional) Seed demo data
```sh
npm run prisma:seed
# uses prisma/seed.ts — see prisma/seed.ts
```

6. Start in development
```sh
npm run start:dev
```

7. Run tests
```sh
npm test
# unit tests live in src/**/*.spec.ts and test setup at test/setup.ts — see jest.config.js
```

## Important files
- Configuration: [src/app.module.ts](src/app.module.ts) and root env files [`.env`](.env) / [`.env.test`](.env.test)  
- HTTP routes: [src/presentation/controllers/payment.controller.ts](src/presentation/controllers/payment.controller.ts)  
- Business logic: [src/application/use-cases](src/application/use-cases)  
- Persistence: [src/infrastructure/repositories/payment.repository.ts](src/infrastructure/repositories/payment.repository.ts)  
- Prisma model: [prisma/schema.prisma](prisma/schema.prisma) and migrations [prisma/migrations](prisma/migrations)

## Testing
- Unit tests: Jest config in [jest.config.js](jest.config.js) and example spec [src/application/use-cases/create-payment.use-case.spec.ts](src/application/use-cases/create-payment.use-case.spec.ts)
- E2E test scaffold: [test/app.e2e-spec.ts](test/app.e2e-spec.ts) and setup file [test/setup.ts](test/setup.ts)

## Notes and tips
- Global Prisma provider is registered in [`PrismaModule`](src/prisma/prisma.module.ts) — see [src/prisma/prisma.module.ts](src/prisma/prisma.module.ts). If you run into DI issues, ensure `PrismaService` is exported and not duplicated in providers.
- Mercado Pago access requires `MERCADO_PAGO_ACCESS_TOKEN` in the environment; adapter uses [src/infrastructure/adapters/mercado-pago/mercado-pago.adapter.ts](src/infrastructure/adapters/mercado-pago/mercado-pago.adapter.ts).
- Validation pipe is provided at app level: [`ValidationPipe`](src/common/pipes/validation.pipe.ts) — [src/common/pipes/validation.pipe.ts](src/common/pipes/validation.pipe.ts).

## Contributing
Follow the existing layering and patterns:
- Place domain models in `src/domain`
- Use application use-cases in `src/application/use-cases`
- Infrastructure adapters/repositories go in `src/infrastructure`
- Presentation controllers and DTOs in `src/presentation`

For linting, testing and formatting use:
- `npm run lint`
- `npm test`
- `npm run format`

## License
Proprietary (see package.json)