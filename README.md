# 🚀 Zeine Back-End

Este é o backend da aplicação Zeine, desenvolvido com **Nest.js**, **Prisma ORM** e **TypeScript**.  
Ele fornece autenticação JWT, upload de imagens e gerenciamento de usuários e produtos.

---

## 🛠 Tecnologias

- **Nest.js** 11+
- **TypeScript**
- **Prisma**
- **JWT Authentication**
- **Bcrypt** para hash de senhas
- **Cookie Parser**
- **CORS** habilitado

---

## ⚡ Pré-requisitos

- **Node.js** v18+
- **NPM**, **Yarn** ou **PNPM**
- **PostgreSQL** rodando localmente ou remoto

---

## 🏁 Rodando localmente

1. **Clone o repositório**
    ```bash
    git clone https://github.com/SEU_USUARIO/SEU_REPO_BACKEND.git
    cd SEU_REPO_BACKEND
    ```

2. **Instale as dependências**
    ```bash
    npm install
    # ou
    yarn
    # ou
    pnpm install
    ```

3. **Configurar variáveis de ambiente**

    Crie um arquivo `.env` na raiz do projeto, usando como base o `.env.example`:

    ```env
    # Chave secreta JWT
    JWT_SECRET=SEU_SEGREDO_SUPER_SECRETO

    # URL do banco de dados PostgreSQL
    DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/zeine?schema=public"

    # Porta do backend
    PORT=5000

    # Base URL do backend
    BASE_URL=http://localhost:5000
    ```

    ⚠️ **Não faça commit do `.env` com valores reais. Use `.env.example` como referência.**

4. **Criar o banco e rodar migrações + seed**
    ```bash
    npm run migrate
    ```
    Este comando irá:
    - Aplicar migrações do Prisma (`prisma migrate dev`)
    - Executar o seed do banco (`prisma db seed`) criando:
      - Usuário admin (`admin@teste.com` / `123456`)
      - Categorias iniciais (Brinquedo, Vestiário, Móvel, Papelaria, Saúde e Beleza, Utensílio)
      - Produtos de exemplo

5. **Rodar o servidor em modo desenvolvimento**
    ```bash
    npm run start:dev
    # ou
    yarn start:dev
    # ou
    pnpm start:dev
    ```

    O servidor estará disponível em [http://localhost:5000](http://localhost:5000).

---

## 🗂 Estrutura do projeto

```
/src
  /auth        # Módulo de autenticação (login, register, guards)
  /users       # CRUD de usuários
  /products    # CRUD de produtos
  /categories  # So para enviar para o front
  /dashboard   # GET para info do dashboard
  /prisma      # Prisma schema e seed
  main.ts      # Entry point do Nest.js
```

Uploads de imagens são servidos pela pasta `/uploads` (configurada no `main.ts`) com prefixo `/uploads/`.

---

## 🔑 Scripts úteis

| Script              | Descrição                                             |
|---------------------|------------------------------------------------------|
| `npm run start`     | Inicia o servidor em produção                        |
| `npm run start:dev` | Inicia o servidor em modo desenvolvimento com hot reload |
| `npm run start:prod`| Inicia o servidor compilado em `dist`                |
| `npm run build`     | Compila o projeto Nest.js para `dist`                |
| `npm run migrate`   | Roda migrações do Prisma + seed                      |
| `npm run seed`      | Apenas executa o seed do banco                       |
| `npm run test`      | Executa testes unitários                             |
| `npm run test:e2e`  | Executa testes end-to-end                            |
| `npm run lint`      | Executa ESLint para corrigir problemas de formatação |
| `npm run format`    | Formata todo o código com Prettier                   |

---

## 🌐 CORS

O backend permite requisições vindas de:

```js
origin: ['https://zeine-frontend.vercel.app', 'http://localhost:3000']
credentials: true
```

---

## 📦 Observações

- Certifique-se de que o banco de dados está rodando antes de executar o seed.
- Os uploads de imagens precisam ser incluídos no `remotePatterns` do frontend Next.js para funcionarem.
- JWT é usado tanto no backend quanto no middleware do frontend para autenticação.
- Usuário admin criado no seed: `admin@teste.com` / `123456`.