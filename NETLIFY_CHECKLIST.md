# ✅ Checklist de Deploy no Netlify

Use este checklist para garantir que tudo está configurado corretamente.

## 📝 Antes de Começar

- [ ] Código está no GitHub
- [ ] Conta criada no Netlify
- [ ] Conta criada no serviço de banco de dados (Supabase, Railway, etc)

---

## 🗄️ Banco de Dados

### Criar Banco
- [ ] Banco PostgreSQL criado em serviço externo
- [ ] DATABASE_URL anotada/salva

### Executar Migrations
- [ ] `001_create_users.sql` executado
- [ ] `002_create_transactions.sql` executado
- [ ] `003_create_kyc_documents.sql` executado
- [ ] `004_create_gateway_logs.sql` executado
- [ ] `005_create_gateway_config.sql` executado
- [ ] `database/init.sql` executado (admin + config gateway)

### Verificar
- [ ] Tabelas criadas com sucesso
- [ ] Admin padrão inserido (admin@gmail.com)
- [ ] Gateway config inserido

---

## ⚙️ Netlify - Configuração Inicial

### Criar Site
- [ ] Novo site criado no Netlify
- [ ] Repositório conectado
- [ ] Branch principal selecionada (main/master)

### Build Settings
- [ ] Build command: `cd frontend && npm install && npm run build`
- [ ] Publish directory: `frontend/dist`
- [ ] Functions directory: `netlify/functions`

### Domínio
- [ ] URL do site anotada: `https://________.netlify.app`
- [ ] Domínio customizado configurado (opcional)

---

## 🔐 Variáveis de Ambiente

### No Netlify Dashboard → Site Settings → Environment Variables

#### Obrigatórias:

- [ ] `DATABASE_URL` = URL do banco PostgreSQL externo
  ```
  postgresql://user:password@host:5432/database
  ```

- [ ] `JWT_SECRET` = String aleatória longa e segura
  ```
  Gere com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- [ ] `FRONTEND_URL` = URL do seu site Netlify
  ```
  https://seu-site.netlify.app
  ```

- [ ] `VITE_API_URL` = URL do seu site Netlify (mesmo valor)
  ```
  https://seu-site.netlify.app
  ```

#### Gateway Pulse VIP:

- [ ] `PULSE_CLIENT_ID` = `e1c98954cc404cbcb2868af9b40c7a33`
- [ ] `PULSE_API_KEY` = `4XJoHefFKOr593cnD5_xCto1FfzbQYtvfS2Il6aPAY2nyt8Vm-Qi_NoZ8VhyVocfuCloLEfNBb-7sKjGxFH-0A`
- [ ] `PULSE_BASE_URL` = `https://pulsepayment.app.br`
- [ ] `PULSE_WEBHOOK_URL` = `https://seu-site.netlify.app/api/webhook/pulse`

#### Outras:

- [ ] `NODE_ENV` = `production`
- [ ] `JWT_EXPIRES_IN` = `7d`

---

## 🚀 Deploy

- [ ] Variáveis todas configuradas
- [ ] Deploy iniciado (automático ou manual)
- [ ] Build completado sem erros
- [ ] Site publicado

---

## ✅ Verificação Pós-Deploy

### Frontend
- [ ] Site acessível: `https://seu-site.netlify.app`
- [ ] Página de login carrega
- [ ] Navegação funciona (não dá erro 404)
- [ ] Assets carregam (CSS, JS, imagens)

### API
- [ ] Endpoint health responde:
  ```bash
  curl https://seu-site.netlify.app/api/health
  ```
- [ ] Resposta esperada: `{"status":"ok","message":"Nibanky API running on Netlify Functions"}`

### Login Admin
- [ ] Consegue acessar login
- [ ] Login com admin@gmail.com / 34762414 funciona
- [ ] Redireciona para /admin
- [ ] Dashboard admin carrega

### Banco de Dados
- [ ] Conexão funciona (não dá erro de database)
- [ ] Dados são salvos
- [ ] Queries funcionam

### Logs
- [ ] Netlify Dashboard → Functions → Ver logs
- [ ] Sem erros críticos nos logs
- [ ] Funções executando com sucesso

---

## 🧪 Testes Funcionais

### Registro de Usuário
- [ ] Acessar /register
- [ ] Criar conta nova
- [ ] Recebe confirmação
- [ ] Consegue fazer login

### KYC
- [ ] Usuário consegue enviar KYC
- [ ] Admin consegue ver KYC pendente
- [ ] Admin consegue aprovar KYC

### Depósito
- [ ] Usuário com KYC aprovado acessa /deposit
- [ ] Consegue gerar QR Code
- [ ] QR Code é exibido
- [ ] Taxa de 2% calculada corretamente

### Saque
- [ ] Usuário com saldo acessa /withdraw
- [ ] Taxa de 15% calculada corretamente
- [ ] Saque processa (ou entra em fila)

### Histórico
- [ ] Transações são exibidas
- [ ] Filtros funcionam
- [ ] Detalhes carregam

---

## 🔧 Troubleshooting

### Se algo não funcionar:

1. **Verificar Logs**
   - [ ] Netlify Dashboard → Deploys → Último deploy → Ver log
   - [ ] Netlify Dashboard → Functions → Ver logs de execução

2. **Verificar Variáveis**
   - [ ] Todas as variáveis estão configuradas?
   - [ ] URLs estão corretas (com https://)?
   - [ ] DATABASE_URL está acessível?

3. **Redeploy**
   - [ ] Limpar cache: Settings → Build & deploy → Clear cache
   - [ ] Trigger deploy: Deploys → Trigger deploy

4. **Testar Localmente**
   - [ ] `cd frontend && npm run build` - Build funciona?
   - [ ] Testar conexão com banco externo

---

## 🎯 Checklist Final

- [ ] ✅ Frontend funcionando
- [ ] ✅ API funcionando
- [ ] ✅ Banco de dados conectado
- [ ] ✅ Login admin funciona
- [ ] ✅ Fluxos principais testados
- [ ] ✅ Sem erros nos logs
- [ ] ✅ Domínio configurado
- [ ] ✅ HTTPS ativo
- [ ] ✅ Variáveis todas configuradas
- [ ] ✅ Documentação lida e entendida

---

## 🔒 Pós-Deploy - Segurança

- [ ] Mudar senha do admin (após primeiro login)
- [ ] Verificar se JWT_SECRET é único (não usar o exemplo)
- [ ] Confirmar que .env não está no repositório
- [ ] Revisar permissões do banco de dados
- [ ] Ativar backup automático do banco (se disponível)

---

## 📚 Referências

- **Guia Completo:** [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)
- **Início Rápido:** [NETLIFY_QUICKSTART.md](./NETLIFY_QUICKSTART.md)
- **Troubleshooting:** [CHECKLIST_ERRORS.md](./CHECKLIST_ERRORS.md)
- **API:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🎉 Pronto!

Se tudo está ✅ marcado, seu sistema está funcionando em produção no Netlify!

**Próximos passos:**
1. Compartilhe a URL com usuários
2. Configure domínio customizado (opcional)
3. Monitore logs e métricas
4. Faça backup regular do banco de dados

---

**Deploy realizado em:** ___/___/______
**URL do site:** _________________________
**Banco usado:** _________________________
