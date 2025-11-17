WK Test | Desenvolvedor Full Stack

Configurações e passos para subir a aplicação

Devem ser criados dois bancos de dados, um para a aplicação e outro para os testes e2e e informa-los corretamente nos arquivos ".env" e ".env.test" da aplicação backend.

===================

BACKEND

$ npm install
"Copiar conteúdo de .env.test e criar arquivo .env, apontando para o banco desejado"

$ dotenv -e .env -- npx prisma migrate dev
$ npm run start:dev

==> Para rodar os testes usar dos comandos abaixo:

$ npm run test
$ npm run test:e2e

===================

FRONTEND

$ npm install

"Criar arquivo .env na raiz do projeto informando a chave abaixo"
NEXT_PUBLIC_API_URL=http://localhost:3000 ou URL da sua API

$ npm run dev

