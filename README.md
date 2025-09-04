# 💰 Controle Financeiro - API

API RESTful desenvolvida com Node.js, TypeScript e PostgreSQL para controle de finanças pessoais ou empresariais. O sistema possui autenticação JWT, registro de transações categorizadas por departamento e vínculo direto com o usuário.


## 🚀 Tecnologias Utilizadas

- Node.js + Express
- TypeScript
- PostgreSQL
- JWT (JSON Web Token)
- Bcrypt
- dotenv
- pg (PostgreSQL client)
- CORS


## 📁 Estrutura do Projeto

controle-financeiro/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db/
│   ├── .env.example
│   └── index.ts
├── frontend/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   ├── services/
│   └── routes/


## 🔐 Autenticação

O sistema utiliza autenticação via JWT. Após o login, o usuário recebe um token que deve ser enviado no header das requisições protegidas.


🛠️ Como rodar localmente

1. Clone o projeto
  git clone https://github.com/seu-usuario/controle-financeiro.git
  cd controle-financeiro/backend

3. Instale as dependências 
  npm install

5. Configure o ambiente
Crie um arquivo .env com base no .env.example:
  PORT=5000
  DATABASE_URL=postgresql://usuario:senha@localhost:5432/controle
  JWT_SECRET=sua_chave_secreta

4. Rode o servidor
  npm run dev
  Servidor rodando em: http://localhost:5000

👨‍💻 Autor
Luiz Felippe
🔗 linkedin.com/in/luiz-felippe-8b3597286
