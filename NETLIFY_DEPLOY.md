# 🚀 Guia Completo de Deploy no Netlify

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Preparação do Banco de Dados](#preparação-do-banco-de-dados)
4. [Configuração no Netlify](#configuração-no-netlify)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Deploy](#deploy)
7. [Verificação](#verificação)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este projeto está configurado para ser hospedado completamente no **Netlify**:

- ✅ **Frontend:** React hospedado como site estático
- ✅ **Backend:** Node.js/Express como Netlify Functions (serverless)
- ⚠️ **Banco de Dados:** PostgreSQL em serviço externo (Netlify não hospeda DB)

**Arquivos importantes:**
- `netlify.toml` - Configuração do Netlify
- `netlify/functions/api.js` - Backend serverless
- `frontend/.env.production` - Variáveis do frontend
- `.env.netlify` - Template de variáveis do backend

---

## 📝 Pré-requisitos

### 1. Conta no Netlify
- Acesse: https://app.netlify.com
- Crie uma conta (gratuita)
- Conecte com seu GitHub

### 2. Repositório no GitHub
- Seu código deve estar em um repositório GitHub
- O Netlify vai conectar diretamente ao repo

### 3. Banco de Dados PostgreSQL Externo
Escolha uma das opções gratuitas:

#### Opção 1: Supabase (Recomendado) ⭐
```
1. Acesse: https://supabase.com
2. Crie conta gratuita
3. Crie novo projeto
4. Anote a Database URL (Settings > Database > Connection String)
5. Execute as migrations SQL do projeto
```

#### Opção 2: Railway
```
1. Acesse: https://railway.app
2. Crie conta gratuita
3. New Project > Provision PostgreSQL
4. Copie a DATABASE_URL
5. Execute as migrations SQL
```

#### Opção 3: ElephantSQL
```
1. Acesse: https://www.elephantsql.com
2. Crie conta gratuita (20MB grátis)
3. Create New Instance
4. Copie a URL
5. Use o navegador SQL para executar migrations
```

---

## 🗄️ Preparação do Banco de Dados

### 1. Executar Migrations

Após criar o banco, execute os scripts SQL na ordem:

```bash
# Conecte ao seu banco de dados e execute:
1. database/migrations/001_create_users.sql
2. database/migrations/002_create_transactions.sql
3. database/migrations/003_create_kyc_documents.sql
4. database/migrations/004_create_gateway_logs.sql
5. database/migrations/005_create_gateway_config.sql
```

### 2. Inserir Dados Iniciais

Execute o script `database/init.sql` para criar:
- Tabelas básicas
- Usuário admin padrão
- Configuração do gateway

**Usuário Admin:**
- Email: admin@gmail.com
- Senha: 34762414

---

## ⚙️ Configuração no Netlify

### Passo 1: Criar Novo Site

1. Faça login no Netlify
2. Clique em **"Add new site"** > **"Import an existing project"**
3. Escolha **GitHub**
4. Autorize o acesso ao Netlify
5. Selecione o repositório `banking-system`

### Passo 2: Configurar Build

O Netlify vai detectar automaticamente o `netlify.toml`, mas confirme:

```
Build command: cd frontend && npm install && npm run build
Publish directory: frontend/dist
Functions directory: netlify/functions
```

### Passo 3: Configurar Variáveis de Ambiente

No painel do Netlify:

1. Vá em **Site settings** > **Environment variables**
2. Clique em **Add a variable**
3. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```bash
# Database (Use a URL do seu banco externo)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT (IMPORTANTE: Mude para um valor único e seguro)
JWT_SECRET=seu_jwt_secret_muito_seguro_e_aleatorio_aqui
JWT_EXPIRES_IN=7d

# Pulse VIP Gateway
PULSE_CLIENT_ID=e1c98954cc404cbcb2868af9b40c7a33
PULSE_API_KEY=4XJoHefFKOr593cnD5_xCto1FfzbQYtvfS2Il6aPAY2nyt8Vm-Qi_NoZ8VhyVocfuCloLEfNBb-7sKjGxFH-0A
PULSE_BASE_URL=https://pulsepayment.app.br
PULSE_WEBHOOK_URL=https://seu-site.netlify.app/api/webhook/pulse

# Server
NODE_ENV=production

# Frontend (Use a URL do seu site Netlify)
FRONTEND_URL=https://seu-site.netlify.app

# Frontend API URL
VITE_API_URL=https://seu-site.netlify.app
```

⚠️ **IMPORTANTE:**
- Substitua `seu-site.netlify.app` pela URL real do seu site
- Mude o `JWT_SECRET` para um valor único e seguro
- Use a `DATABASE_URL` do seu banco externo

### Passo 4: Configurar Domínio (Opcional)

1. Vá em **Domain settings**
2. Escolha um subdomínio: `seu-banco.netlify.app`
3. Ou adicione domínio customizado

---

## 🚀 Deploy

### Deploy Automático

1. Depois de configurar tudo, clique em **"Deploy site"**
2. O Netlify vai:
   - Fazer clone do repositório
   - Instalar dependências
   - Executar build do frontend
   - Configurar serverless functions
   - Publicar o site

### Deploy Manual (via CLI)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Na raiz do projeto
netlify init

# Deploy
netlify deploy --prod
```

---

## ✅ Verificação

### 1. Testar Frontend

Acesse: `https://seu-site.netlify.app`

- ✅ Página carrega
- ✅ Pode fazer login
- ✅ Navegação funciona

### 2. Testar API

```bash
# Teste health check
curl https://seu-site.netlify.app/api/health

# Resposta esperada:
{
  "status": "ok",
  "message": "Nibanky API running on Netlify Functions",
  "timestamp": "2026-02-15T..."
}
```

### 3. Testar Login Admin

```
1. Acesse: https://seu-site.netlify.app
2. Login: admin@gmail.com
3. Senha: 34762414
4. Deve acessar /admin com sucesso
```

### 4. Testar Fluxos Principais

- ✅ Registro de usuário
- ✅ Login
- ✅ Envio de KYC
- ✅ Aprovação de KYC (admin)
- ✅ Depósito (gerar QR Code)
- ✅ Saque
- ✅ Histórico de transações

---

## 🔧 Troubleshooting

### Problema 1: Build Falhou

**Erro:** `Build script returned non-zero exit code`

**Solução:**
```bash
# Verifique o log de build no Netlify
# Geralmente é falta de dependências ou erro de sintaxe

# Teste localmente:
cd frontend
npm install
npm run build
```

### Problema 2: API não responde

**Erro:** `404 Not Found` em `/api/*`

**Solução:**
1. Verifique se `netlify.toml` está na raiz
2. Confirme que a pasta `netlify/functions` existe
3. Verifique os logs da função no Netlify
4. Certifique-se que as variáveis de ambiente estão configuradas

### Problema 3: Erro de Banco de Dados

**Erro:** `Connection refused` ou `Database error`

**Solução:**
1. Verifique se `DATABASE_URL` está correta
2. Confirme que o banco externo está online
3. Teste a conexão diretamente:
```bash
psql "sua-database-url-aqui"
```
4. Verifique se as migrations foram executadas

### Problema 4: CORS Error

**Erro:** `Access-Control-Allow-Origin`

**Solução:**
1. Certifique-se que `FRONTEND_URL` está configurada
2. Verifique se a URL está correta (com https://)
3. Redeploye após mudar variáveis

### Problema 5: JWT não funciona

**Erro:** `Invalid token` ou `Unauthorized`

**Solução:**
1. Limpe localStorage do navegador
2. Faça login novamente
3. Verifique se `JWT_SECRET` está configurado no Netlify
4. Certifique-se que é o mesmo secret usado para criar os tokens

### Problema 6: Function Timeout

**Erro:** `Function execution timed out`

**Solução:**
- Plano gratuito: timeout de 10 segundos
- Plano Pro: timeout de 26 segundos
- Otimize queries do banco
- Use cache quando possível
- Considere upgrade do plano se necessário

### Problema 7: Variáveis de Ambiente não funcionam

**Erro:** `undefined` ao acessar `process.env.XXX`

**Solução:**
1. Variáveis do backend: Configure no Netlify Dashboard
2. Variáveis do frontend: Use prefixo `VITE_`
3. Depois de mudar variáveis, faça redeploy
4. Limpe cache do build: Settings > Build & deploy > Clear cache

---

## 📊 Limites do Plano Gratuito Netlify

- ✅ 100GB bandwidth/mês
- ✅ 300 build minutes/mês
- ✅ 125k function invocations/mês
- ✅ 100GB function bandwidth/mês
- ⏱️ 10 segundos timeout por function
- 💾 50MB max function size

Para banco com mais recursos, considere upgrade ou use banco externo robusto.

---

## 🔐 Segurança em Produção

### 1. Mude Senhas

```bash
# OBRIGATÓRIO: Mude em produção
- JWT_SECRET (use string aleatória longa)
- Admin password (mude no banco após primeiro login)
```

### 2. Configure HTTPS

- Netlify fornece HTTPS automático
- Certifique-se que está usando apenas `https://`

### 3. Proteja Variáveis

- Nunca commite arquivos `.env` no git
- Use apenas Netlify Dashboard para variáveis sensíveis

### 4. Rate Limiting

O sistema já tem rate limiting configurado:
- Auth: 5 req/15min
- Transactions: 20 req/15min
- Geral: 100 req/15min

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Deploy](https://docs.netlify.com/site-deploys/overview/)
- [Environment Variables](https://docs.netlify.com/environment-variables/overview/)

### Monitoramento
- [Netlify Analytics](https://docs.netlify.com/monitor-sites/analytics/)
- [Function Logs](https://docs.netlify.com/functions/logs/)

### Banco de Dados Gratuitos
- [Supabase](https://supabase.com) - 500MB, PostgreSQL
- [Railway](https://railway.app) - PostgreSQL gratuito
- [ElephantSQL](https://www.elephantsql.com) - 20MB grátis

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Banco de dados externo criado e configurado
- [ ] Migrations SQL executadas
- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] `DATABASE_URL` correta
- [ ] `JWT_SECRET` único e seguro
- [ ] `FRONTEND_URL` e `VITE_API_URL` com URL correta
- [ ] `PULSE_WEBHOOK_URL` com URL correta
- [ ] Build realizado com sucesso
- [ ] Frontend acessível
- [ ] API respondendo (/api/health)
- [ ] Login admin funciona
- [ ] Fluxos principais testados

---

## 🎉 Conclusão

Seu sistema bancário Nibanky está agora hospedado no Netlify!

**URLs importantes:**
- Frontend: https://seu-site.netlify.app
- API: https://seu-site.netlify.app/api
- Admin: https://seu-site.netlify.app/admin

**Suporte:**
- Issues: Crie issue no GitHub
- Documentação: Veja outros arquivos .md do projeto
- Netlify: https://answers.netlify.com

---

**Desenvolvido com ❤️ para Nibanky Digital Banking**
