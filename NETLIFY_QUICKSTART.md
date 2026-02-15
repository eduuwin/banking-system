# 🚀 Deploy Rápido no Netlify

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Preparar Banco de Dados

Escolha uma opção gratuita:

**Supabase (Recomendado):**
1. https://supabase.com → Sign up
2. New project → Copie Database URL
3. SQL Editor → Execute scripts de `database/migrations/`
4. Execute `database/init.sql`

### 2️⃣ Deploy no Netlify

1. https://app.netlify.com → Login
2. Add new site → Import from Git
3. Escolha seu repositório
4. Configurar:
   - Build: `cd frontend && npm install && npm run build`
   - Publish: `frontend/dist`
   - Functions: `netlify/functions`

### 3️⃣ Variáveis de Ambiente

No Netlify Dashboard → Site settings → Environment variables:

```bash
DATABASE_URL=sua-database-url-do-supabase
JWT_SECRET=seu-secret-super-seguro-aleatorio
FRONTEND_URL=https://seu-site.netlify.app
VITE_API_URL=https://seu-site.netlify.app
PULSE_CLIENT_ID=e1c98954cc404cbcb2868af9b40c7a33
PULSE_API_KEY=4XJoHefFKOr593cnD5_xCto1FfzbQYtvfS2Il6aPAY2nyt8Vm-Qi_NoZ8VhyVocfuCloLEfNBb-7sKjGxFH-0A
PULSE_BASE_URL=https://pulsepayment.app.br
PULSE_WEBHOOK_URL=https://seu-site.netlify.app/api/webhook/pulse
NODE_ENV=production
JWT_EXPIRES_IN=7d
```

### 4️⃣ Deploy!

Clique em **"Deploy site"** e aguarde 2-3 minutos.

### 5️⃣ Testar

```bash
# Acesse seu site
https://seu-site.netlify.app

# Login admin
Email: admin@gmail.com
Senha: 34762414
```

---

## 📚 Documentação Completa

Para instruções detalhadas, veja: [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)

---

## ⚠️ Importante

1. **Mude o JWT_SECRET** para um valor único
2. **Use DATABASE_URL** do seu banco externo
3. **Atualize URLs** com seu domínio Netlify
4. **Mude senha admin** após primeiro login

---

## 🔧 Troubleshooting

### API não responde?
- Verifique variáveis de ambiente
- Veja logs: Netlify Dashboard → Functions

### Banco não conecta?
- Confirme DATABASE_URL
- Teste conexão diretamente

### Build falhou?
- Veja logs no Netlify
- Teste local: `cd frontend && npm run build`

---

## 📞 Suporte

- 📖 [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) - Guia completo
- 📖 [CHECKLIST_ERRORS.md](./CHECKLIST_ERRORS.md) - Solução de problemas
- 📖 [README.md](./README.md) - Documentação geral

---

**✅ Sistema pronto para produção no Netlify!**
