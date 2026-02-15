# 🚀 Deploy no GitHub + Netlify

## Seu Projeto Rodando Online em 10 Minutos

Este guia mostra como ter seu projeto **rodando online** e acessível via link.

---

## ✅ Status Atual

- ✅ Código no GitHub: `https://github.com/eduuwin/banking-system`
- ✅ Netlify configurado
- ✅ GitHub Actions pronto
- ⏳ Aguardando deploy

---

## 🎯 Objetivo

Ter o sistema rodando em:
- **Frontend:** `https://nibanky.netlify.app` (ou seu domínio)
- **API:** `https://nibanky.netlify.app/api/*`
- **Admin:** `https://nibanky.netlify.app/admin`

---

## 📋 Passo a Passo

### 1️⃣ Criar Conta no Netlify (2 minutos)

1. Acesse: https://app.netlify.com/signup
2. Clique em **"Sign up with GitHub"**
3. Autorize o Netlify a acessar seus repositórios

### 2️⃣ Conectar Repositório (3 minutos)

1. No Netlify Dashboard, clique em **"Add new site"**
2. Escolha **"Import an existing project"**
3. Selecione **"GitHub"**
4. Encontre e selecione: **`eduuwin/banking-system`**
5. Configure o build:

```
Build command: cd frontend && npm run build
Publish directory: frontend/dist
Branch: copilot/create-complete-digital-bank
```

6. Clique em **"Deploy site"**

### 3️⃣ Configurar Banco de Dados (5 minutos)

**Opção A: Supabase (Recomendado)**

1. Acesse: https://supabase.com
2. Crie novo projeto
3. Copie a **Database URL** (Settings → Database → Connection string)
4. Execute as migrations:
   - Abra SQL Editor no Supabase
   - Cole o conteúdo de `database/init.sql`
   - Execute

**Opção B: Railway**

1. Acesse: https://railway.app
2. New Project → Provision PostgreSQL
3. Copie a **DATABASE_URL**
4. Use um client SQL para executar `database/init.sql`

### 4️⃣ Configurar Variáveis de Ambiente (3 minutos)

No Netlify Dashboard:
1. Vá em **Site settings → Environment variables**
2. Clique em **"Add a variable"**
3. Adicione cada variável:

```bash
# Essenciais
DATABASE_URL=postgresql://...  # Cole a URL do seu banco
JWT_SECRET=mude-para-algo-muito-seguro-e-aleatorio-123456789
NODE_ENV=production

# URLs (atualize com seu domínio Netlify)
FRONTEND_URL=https://seu-site.netlify.app
VITE_API_URL=https://seu-site.netlify.app

# Gateway Pulse VIP
PULSE_CLIENT_ID=e1c98954cc404cbcb2868af9b40c7a33
PULSE_API_KEY=4XJoHefFKOr593cnD5_xCto1FfzbQYtvfS2Il6aPAY2nyt8Vm-Qi_NoZ8VhyVocfuCloLEfNBb-7sKjGxFH-0A
PULSE_BASE_URL=https://pulsepayment.app.br
PULSE_WEBHOOK_URL=https://seu-site.netlify.app/api/webhook/pulse

# Outras
JWT_EXPIRES_IN=7d
PORT=5000
```

### 5️⃣ Configurar GitHub Actions (Opcional)

Para deploy automático a cada push:

1. No GitHub, vá em: **Settings → Secrets and variables → Actions**
2. Adicione os secrets:

```
NETLIFY_AUTH_TOKEN=  # Pegue em: https://app.netlify.com/user/applications#personal-access-tokens
NETLIFY_SITE_ID=     # Pegue em: Site settings → General → Site details → Site ID
VITE_API_URL=https://seu-site.netlify.app
```

### 6️⃣ Redeploy (1 minuto)

1. No Netlify Dashboard, clique em **"Trigger deploy"**
2. Selecione **"Deploy site"**
3. Aguarde o build completar (2-3 minutos)

---

## 🎉 Pronto! Seu Site Está no Ar

### Acesse Seu Projeto:

**URL Principal:**
```
https://seu-site.netlify.app
```

(Substitua `seu-site` pelo nome que o Netlify gerou)

### Testar:

1. **Frontend:** Abra a URL principal
2. **API Health:** `https://seu-site.netlify.app/api/health`
3. **Admin Login:** Use `admin@gmail.com` / `34762414`

---

## 📱 Encontrar Seu Link

### Opção 1: Netlify Dashboard
1. Acesse https://app.netlify.com
2. Clique no seu site
3. Veja a URL no topo: `https://seu-site.netlify.app`

### Opção 2: GitHub Actions
1. Vá em **Actions** no seu repositório
2. Veja o último workflow executado
3. O link aparece nos logs

### Opção 3: Badge no README
Adicionamos um badge que mostra o status e link

---

## 🔧 Troubleshooting

### Build Falhou
```bash
# Verifique os logs no Netlify Dashboard
# Comum: dependências faltando

Solução:
1. Certifique-se que frontend/package.json existe
2. Verifique se o comando de build está correto
3. Revise as variáveis de ambiente
```

### Site Carrega mas API não Funciona
```bash
# Problema: Functions não deployadas

Solução:
1. Verifique se netlify.toml está na raiz
2. Confirme que netlify/functions/api.js existe
3. Revise a DATABASE_URL nas variáveis
```

### Erro 500 na API
```bash
# Problema: Banco de dados não conecta

Solução:
1. Teste a DATABASE_URL localmente
2. Certifique-se que migrations foram executadas
3. Verifique se o banco está ativo
```

### Página 404
```bash
# Problema: SPA routing não configurado

Solução:
1. Verifique se _redirects existe em frontend/public
2. Confirme que netlify.toml tem os redirects
3. Redeploy o site
```

---

## 🌐 Domínio Customizado (Opcional)

### Mudar de `seu-site.netlify.app` para `seudominio.com`:

1. No Netlify: **Domain settings**
2. Clique **"Add custom domain"**
3. Digite seu domínio
4. Siga as instruções de DNS

---

## 📊 Monitoramento

### Ver Status do Deploy:

1. **Netlify Dashboard:** Veja os deploys recentes
2. **GitHub Actions:** Acompanhe o workflow
3. **Badge no README:** Status visual

### Ver Logs:

1. Netlify: **Functions → Logs**
2. Veja erros e requisições em tempo real

---

## 🎯 Checklist Final

Antes de usar em produção:

- [ ] Site acessível na URL
- [ ] API respondendo (`/api/health`)
- [ ] Login admin funcionando
- [ ] Banco de dados conectado
- [ ] Migrations executadas
- [ ] Variáveis de ambiente configuradas
- [ ] JWT_SECRET mudado
- [ ] Senha admin mudada
- [ ] Domínio customizado (opcional)
- [ ] Backup do banco configurado

---

## 📚 Documentação Relacionada

- [NETLIFY_QUICKSTART.md](./NETLIFY_QUICKSTART.md) - Deploy rápido
- [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) - Guia completo
- [NETLIFY_CHECKLIST.md](./NETLIFY_CHECKLIST.md) - Verificações
- [CHECKLIST_ERRORS.md](./CHECKLIST_ERRORS.md) - Soluções de problemas

---

## 💡 Dicas

### Performance
- Netlify CDN distribui globalmente
- Functions com cache automático
- Assets otimizados no build

### Segurança
- HTTPS automático
- Variáveis protegidas
- Headers configurados

### Custo
- Plano gratuito: 100GB bandwidth/mês
- Suficiente para ~10.000 usuários/mês
- Upgrade só se necessário

---

## 🆘 Precisa de Ajuda?

**Documentação:**
- [Netlify Docs](https://docs.netlify.com)
- [Supabase Docs](https://supabase.com/docs)

**Comunidade:**
- [Netlify Community](https://answers.netlify.com)
- [GitHub Issues](https://github.com/eduuwin/banking-system/issues)

---

## ✅ Resumo

Você tem:
- ✅ Código no GitHub
- ✅ Netlify configurado
- ✅ Deploy automático pronto
- ✅ Documentação completa

Faça:
1. Conectar repositório no Netlify (3 min)
2. Configurar banco de dados (5 min)
3. Adicionar variáveis (3 min)
4. Deploy! (2 min)

**Resultado:** Link do seu site rodando! 🎉

---

**Desenvolvido com ❤️ para Nibanky Digital Banking**
