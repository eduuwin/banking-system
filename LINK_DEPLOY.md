# 🚀 GUIA RÁPIDO: Link do Projeto Rodando

## ✅ Seu código já está no GitHub!

**Repositório:** https://github.com/eduuwin/banking-system

---

## 🎯 Agora você precisa DEPLOYAR para ter o link rodando

Siga estes passos para ter seu site online:

---

## 📋 3 Passos Simples

### 1️⃣ Conectar no Netlify (3 minutos)

1. Acesse: **https://app.netlify.com**
2. Clique em **"Sign up with GitHub"** (se não tem conta)
3. Clique em **"Add new site" → "Import an existing project"**
4. Selecione **GitHub**
5. Escolha o repositório: **eduuwin/banking-system**
6. Configure:
   ```
   Branch: copilot/create-complete-digital-bank
   Build command: cd frontend && npm run build
   Publish directory: frontend/dist
   ```
7. Clique em **"Deploy site"**

### 2️⃣ Configurar Banco de Dados (5 minutos)

**Use Supabase (grátis):**

1. Vá em: **https://supabase.com**
2. Crie um projeto novo
3. Vá em **Settings → Database**
4. Copie a **Connection string** (DATABASE_URL)
5. Abra **SQL Editor**
6. Cole todo o conteúdo do arquivo `database/init.sql`
7. Execute (Run)

### 3️⃣ Adicionar Variáveis no Netlify (2 minutos)

No Netlify Dashboard:
1. Clique no seu site
2. Vá em **Site settings → Environment variables**
3. Clique em **"Add a variable"**
4. Adicione estas variáveis:

```bash
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres
JWT_SECRET=mude-isso-para-algo-muito-seguro-123456789
NODE_ENV=production
FRONTEND_URL=https://seu-site.netlify.app
VITE_API_URL=https://seu-site.netlify.app
PULSE_CLIENT_ID=e1c98954cc404cbcb2868af9b40c7a33
PULSE_API_KEY=4XJoHefFKOr593cnD5_xCto1FfzbQYtvfS2Il6aPAY2nyt8Vm-Qi_NoZ8VhyVocfuCloLEfNBb-7sKjGxFH-0A
PULSE_BASE_URL=https://pulsepayment.app.br
PULSE_WEBHOOK_URL=https://seu-site.netlify.app/api/webhook/pulse
JWT_EXPIRES_IN=7d
PORT=5000
```

⚠️ **Importante:** Substitua:
- `DATABASE_URL` com a URL do Supabase
- `seu-site` com o nome do seu site no Netlify
- `JWT_SECRET` com algo único e seguro

---

## 🎉 Pronto! Pegue seu link:

1. No Netlify Dashboard, você verá: **`https://seu-site.netlify.app`**
2. Clique para abrir
3. Seu sistema está rodando! 🚀

---

## 🔐 Fazer Login:

**URL:** `https://seu-site.netlify.app`

**Admin:**
- Email: admin@gmail.com
- Senha: 34762414

**Dashboard Admin:**
- URL: `https://seu-site.netlify.app/admin`

---

## ✅ Verificar se Funcionou:

### Frontend:
```
https://seu-site.netlify.app
→ Deve mostrar página de login
```

### API:
```
https://seu-site.netlify.app/api/health
→ Deve retornar: {"status":"ok"}
```

### Admin:
```
https://seu-site.netlify.app/admin
→ Login com admin@gmail.com / 34762414
```

---

## ❌ Problemas?

### Site não abre
- Aguarde 2-3 minutos após o deploy
- Verifique se o build foi bem-sucedido no Netlify

### API retorna erro
- Verifique se adicionou todas as variáveis de ambiente
- Confirme que o banco de dados está rodando
- Teste a DATABASE_URL

### Build falhou
- Veja os logs no Netlify Dashboard
- Certifique-se que selecionou a branch correta

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- [GITHUB_DEPLOY.md](./GITHUB_DEPLOY.md) - Guia completo
- [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) - Documentação Netlify
- [NETLIFY_QUICKSTART.md](./NETLIFY_QUICKSTART.md) - Início rápido

---

## 🎯 Resumo

✅ **O que você tem:**
- Código no GitHub
- Configuração de deploy pronta
- Documentação completa

✅ **O que você precisa fazer:**
1. Conectar no Netlify (3 min)
2. Criar banco no Supabase (5 min)
3. Adicionar variáveis (2 min)

✅ **O que você vai ter:**
- Link do site rodando
- Sistema acessível online
- Pronto para usar

**Tempo total: ~10 minutos**

---

**🚀 Seu site estará rodando em: `https://seu-site.netlify.app`**
