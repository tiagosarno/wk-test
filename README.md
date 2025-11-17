WK Test | Desenvolvedor Full Stack

Configurações e passos para subir a aplicação

BACKEND

$ npm install
"Copiar conteúdo de .env.test e criar arquivo .env, apontando para o banco desejado"

$ dotenv -e .env -- npx prisma migrate dev
$ npm run start:dev

================================================

FRONTEND

$ npm install

"Criar arquivo .env na raiz do projeto informando a chave abaixo"
NEXT_PUBLIC_API_URL=http://localhost:3000 ou URL da sua API

$ npm run dev

