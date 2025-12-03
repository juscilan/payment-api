import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Criar pagamentos de exemplo
  await prisma.payment.createMany({
    data: [
      {
        cpf: '12345678901',
        description: 'Pagamento de teste PIX',
        amount: 150.75,
        paymentMethod: 'PIX',
        status: 'PENDING',
      },
      {
        cpf: '98765432109',
        description: 'Pagamento de teste Cartão',
        amount: 299.90,
        paymentMethod: 'CREDIT_CARD',
        status: 'PAID',
        externalId: 'mp_pref_123456',
      },
      {
        cpf: '12345678901',
        description: 'Outro pagamento PIX',
        amount: 50.00,
        paymentMethod: 'PIX',
        status: 'FAIL',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });