// Configurações globais para os testes
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