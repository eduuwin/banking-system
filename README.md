# 🏦 Nibanky - Banco Digital Completo

Sistema bancário digital completo com frontend React, backend Node.js/Express, banco de dados PostgreSQL e integração com o gateway de pagamento **Pulse VIP**.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 Início Rápido

### Desenvolvimento Local

**Quer começar agora?** Veja o **[Guia Rápido de Instalação](./QUICKSTART_PT.md)** 📖

**Ou use os scripts de inicialização:**
```bash
# Linux/Mac
./start.sh

# Windows
start.bat
```

### Deploy em Produção (Netlify) ⚡

**Hospedar no Netlify em 5 minutos:**

1. 📖 **[NETLIFY_QUICKSTART.md](./NETLIFY_QUICKSTART.md)** - Início rápido
2. 📚 **[NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)** - Guia completo

**Deploy rápido:**
```bash
# 1. Criar banco no Supabase (grátis)
# 2. Conectar repo ao Netlify
# 3. Configurar variáveis de ambiente
# 4. Deploy automático!
```

---

## 📋 Índice

- [🚀 Início Rápido](#-início-rápido)
- [Recursos](#-recursos)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Funcionalidades](#-funcionalidades)
- [Screenshots](#-screenshots)
- [Licença](#-licença)

## ✨ Recursos

### Para Usuários:
- ✅ Registro e autenticação com JWT
- ✅ Dashboard com saldo e transações recentes
- ✅ Depósitos via PIX com QR Code (taxa de 2%)
- ✅ Saques para chave PIX (com taxa de 15%)
- ✅ Transferências PIX entre usuários
- ✅ Geração de QR Code para receber pagamentos
- ✅ Histórico completo de transações
- ✅ Sistema de KYC (verificação de identidade)
- ✅ Gerenciamento de perfil
- ✅ Segurança com alteração de senha

### Para Administradores:
- ✅ Dashboard com estatísticas do sistema
- ✅ Gerenciamento de usuários
- ✅ Aprovação/rejeição de KYC
- ✅ Monitoramento de transações
- ✅ Configuração do gateway de pagamento
- ✅ Visualização de logs do gateway

## 🚀 Tecnologias

### Frontend:
- **React 18** - Framework UI
- **React Router DOM** - Roteamento
- **Framer Motion** - Animações
- **Axios** - Cliente HTTP
- **Vite** - Build tool

### Backend:
- **Node.js 18+** - Runtime
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Winston** - Logging
- **Axios** - Cliente HTTP para API Pulse VIP

### DevOps:
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **PostgreSQL 15** - Banco de dados

## 📦 Pré-requisitos

- Docker e Docker Compose instalados
- Ou Node.js 18+ e PostgreSQL 15 (para desenvolvimento local)

## 🔧 Instalação

### Usando Docker (Recomendado)

1. Clone o repositório:
```bash
git clone https://github.com/eduuwin/banking-system.git
cd banking-system
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. Inicie o sistema completo:
```bash
docker-compose up --build
```

O sistema estará disponível em:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **PostgreSQL:** localhost:5432

### Desenvolvimento Local

#### Backend:
```bash
cd backend
npm install
npm run dev
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

#### Database:
```bash
# Execute o script init.sql no PostgreSQL
psql -U postgres -d nibanky -f database/init.sql
```

## 🎯 Uso

### Primeiro Acesso

1. Acesse http://localhost:3000
2. Clique em "Criar conta"
3. Preencha seus dados e complete o registro
4. Faça login com suas credenciais

### Usuário Comum

1. **Verificação KYC:**
   - Acesse "Perfil" > "Verificação KYC"
   - Envie seus documentos (RG ou CNH)
   - Aguarde aprovação do admin

2. **Fazer um Depósito:**
   - Clique em "Depositar"
   - Digite o valor (mínimo R$ 10)
   - Gere o QR Code PIX
   - Pague usando seu app bancário
   - Aguarde confirmação automática
   - **Taxa:** 2% do valor depositado

3. **Fazer um Saque:**
   - Clique em "Sacar"
   - Digite o valor e a chave PIX
   - Confirme a operação (taxa de 15%)
   - Aguarde o processamento

4. **Transferir via PIX:**
   - Acesse "PIX"
   - Digite a chave PIX do destinatário
   - Digite o valor e descrição
   - Confirme a transferência

### Usuário Administrador

**Login padrão:**
- **Email:** admin@gmail.com
- **Senha:** 34762414

1. **Acessar Painel Admin:**
   - Faça login com conta admin
   - Acesse /admin

2. **Aprovar KYC:**
   - Vá para "Admin" > "KYC"
   - Visualize os documentos enviados
   - Aprove ou rejeite com motivo

3. **Gerenciar Usuários:**
   - Acesse "Admin" > "Usuários"
   - Visualize, ative/desative usuários
   - Ajuste saldos se necessário

---

## 💰 Taxas e Limites

### Depósitos
- **Valor mínimo:** R$ 10,00
- **Taxa:** 2% do valor depositado
- **Exemplo:** Depósito de R$ 100 → Você recebe R$ 98 creditados

### Saques
- **Valor mínimo:** R$ 20,00
- **Taxa:** 15% do valor solicitado
- **Exemplo:** Saque de R$ 100 → Taxa R$ 15 → Total debitado R$ 115 → Você recebe R$ 85

### Transferências PIX
- **Valor mínimo:** R$ 1,00
- **Taxa:** Gratuito entre usuários do sistema

---

## 🔐 Credenciais de Admin

Para acessar o painel administrativo:
- **URL:** http://localhost:3000/admin
- **Email:** admin@gmail.com
- **Senha:** 34762414
- **KYC:** Pré-aprovado

**Importante:** Altere a senha em produção!

---

## 📋 Documentação Adicional

- 🚀 [Guia Rápido](./QUICKSTART_PT.md) - Como começar em 5 minutos
- ✅ [Checklist de Erros](./CHECKLIST_ERRORS.md) - Detectar e corrigir problemas
- 🌐 [Guia de Hospedagem](./DEPLOYMENT.md) - Deploy em produção
- 🔌 [API Documentation](./API_DOCUMENTATION.md) - Referência completa da API
- 🏗️ [Arquitetura](./ARCHITECTURE.md) - Estrutura técnica do sistema

---

## 📁 Estrutura do Projeto

```
banking-system/
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # React Context (Auth)
│   │   ├── pages/         # Páginas do app
│   │   │   ├── admin/     # Páginas admin
│   │   │   └── ...        # Páginas de usuário
│   │   ├── services/      # Chamadas API
│   │   ├── styles/        # CSS global
│   │   └── utils/         # Funções utilitárias
│   ├── Dockerfile
│   └── package.json
│
├── backend/               # API Node.js/Express
│   ├── src/
│   │   ├── config/        # Configurações (DB, Pulse)
│   │   ├── controllers/   # Controladores de rotas
│   │   ├── middleware/    # Middlewares (auth, admin)
│   │   ├── models/        # Modelos de dados
│   │   ├── routes/        # Definição de rotas
│   │   ├── services/      # Serviços (Pulse VIP)
│   │   └── utils/         # Utilitários
│   ├── Dockerfile
│   └── package.json
│
├── database/              # Scripts de banco de dados
│   ├── migrations/        # Migrações SQL
│   └── init.sql          # Script de inicialização
│
├── docker-compose.yml     # Orquestração Docker
├── .env.example          # Exemplo de variáveis
└── README.md             # Esta documentação
```

## 🔌 API Endpoints

### Autenticação
```
POST   /api/auth/register   - Registrar usuário
POST   /api/auth/login      - Login
POST   /api/auth/logout     - Logout
```

### Usuário
```
GET    /api/user/profile         - Obter perfil
PUT    /api/user/profile         - Atualizar perfil
GET    /api/user/balance         - Obter saldo
POST   /api/user/change-password - Alterar senha
```

### Transações
```
GET    /api/transactions           - Listar transações
GET    /api/transactions/:id       - Obter transação
POST   /api/transactions/deposit   - Criar depósito
POST   /api/transactions/withdraw  - Criar saque
POST   /api/transactions/pix       - Transferência PIX
GET    /api/transactions/stats     - Estatísticas
```

### KYC
```
POST   /api/kyc/submit   - Enviar documentos
GET    /api/kyc/status   - Verificar status
```

### Admin
```
GET    /api/admin/stats              - Estatísticas gerais
GET    /api/admin/users              - Listar usuários
GET    /api/admin/users/:id          - Obter usuário
PUT    /api/admin/users/:id          - Atualizar usuário
GET    /api/admin/kyc                - Listar KYCs
PUT    /api/admin/kyc/:id/approve    - Aprovar KYC
PUT    /api/admin/kyc/:id/reject     - Rejeitar KYC
GET    /api/admin/transactions       - Listar transações
PUT    /api/admin/transactions/:id/cancel - Cancelar transação
GET    /api/admin/gateway            - Obter config gateway
PUT    /api/admin/gateway/:id        - Atualizar gateway
GET    /api/admin/logs               - Listar logs
```

### Webhook
```
POST   /api/webhook/pulse   - Webhook Pulse VIP
```

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Database
DATABASE_URL=postgresql://nibanky_user:nibanky_pass@localhost:5432/nibanky

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Pulse VIP Gateway
PULSE_CLIENT_ID=e1c98954cc404cbcb2868af9b40c7a33
PULSE_API_KEY=4XJoHefFKOr593cnD5_xCto1FfzbQYtvfS2Il6aPAY2nyt8Vm-Qi_NoZ8VhyVocfuCloLEfNBb-7sKjGxFH-0A
PULSE_BASE_URL=https://pulsepayment.app.br
PULSE_WEBHOOK_URL=http://localhost:5000/api/webhook/pulse

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000
```

## 💡 Funcionalidades

### Sistema de KYC
- Upload de documentos (RG ou CNH)
- Selfie para verificação
- Aprovação/rejeição por admin
- Status: pending, submitted, approved, rejected

### Transações PIX
- Depósitos via QR Code (taxa de 2%)
- Saques com taxa de 15%
- Transferências entre usuários (gratuito)
- Integração com Pulse VIP Gateway

### Regras de Negócio
- Depósito mínimo: R$ 10,00
- Saque mínimo: R$ 20,00
- KYC obrigatório para transações
- Saldo não pode ficar negativo
- Webhook automático para confirmação

### Segurança
- Senhas com hash bcrypt (10 rounds)
- JWT com expiração de 7 dias
- CORS configurado
- Validação de inputs
- Logs de todas operações

## 📊 Banco de Dados

### Entidades:
1. **users** - Dados dos usuários
2. **transactions** - Histórico de transações
3. **kyc_documents** - Documentos de verificação
4. **gateway_logs** - Logs de integração
5. **gateway_config** - Configuração do gateway

## 🎨 Design System

### Cores:
- **Primary:** #7C3AED (Violet/Purple)
- **Secondary:** #10B981 (Green)
- **Danger:** #EF4444 (Red)
- **Warning:** #F59E0B (Orange)
- **Info:** #3B82F6 (Blue)

### Tipografia:
- **Font:** Inter (Google Fonts)
- **Mobile-first** com bottom navigation

## 📱 Screenshots

### Dashboard
Visualização do saldo, status KYC e transações recentes.

### Depósito via PIX
Geração de QR Code para depósito.

### Painel Admin
Gerenciamento completo do sistema.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Nibanky Team**

## 🙏 Agradecimentos

- Pulse VIP pela API de pagamentos
- Comunidade open source

---

**Nota:** Este é um projeto educacional. Para uso em produção, implemente medidas de segurança adicionais, como rate limiting, 2FA, e auditoria completa de segurança.