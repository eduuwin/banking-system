# 📋 CHECKLIST DE ERROS E CORREÇÕES - Sistema Nibanky

Este documento contém verificações essenciais para detectar e corrigir erros no sistema bancário Nibanky.

---

## 🔍 VERIFICAÇÕES DE TAXAS

### Taxa de Saque (15%)
- [ ] Verificar em `backend/src/services/pulseService.js`
  - Linha ~108: `const fee = amount * 0.15;` ✅
  - Linha ~109: `const netAmount = amount - fee;` ✅

- [ ] Verificar em `backend/src/controllers/transactionController.js`
  - Linha ~147: `const fee = amount * 0.15;` ✅
  - Linha ~148: `const totalRequired = amount + fee;` ✅
  - Linha ~183: Rollback com 15%: `amount + (amount * 0.15)` ✅

**Como testar:**
```bash
# Fazer saque de R$ 100
# Taxa esperada: R$ 15
# Total debitado: R$ 115
# Valor líquido recebido: R$ 85
```

### Taxa de Depósito (2%)
- [ ] Verificar em `backend/src/services/pulseService.js`
  - Linha ~17: `const fee = amount * 0.02;` ✅
  - Linha ~18: `const netAmount = amount - fee;` ✅
  - Linha ~21: fee é salvo corretamente ✅
  - Linha ~22: net_amount é salvo corretamente ✅

- [ ] Verificar webhook em `backend/src/controllers/webhookController.js`
  - Linha ~65: Credita `transaction.net_amount` (após taxa) ✅

**Como testar:**
```bash
# Fazer depósito de R$ 100
# Taxa esperada: R$ 2
# Valor creditado na conta: R$ 98
```

---

## 🔐 VERIFICAÇÕES DE AUTENTICAÇÃO

### Admin Padrão
- [ ] Verificar em `database/init.sql`
  - Email: admin@gmail.com ✅
  - Senha: 34762414 ✅
  - is_admin: true ✅
  - kyc_status: approved ✅

**Como testar:**
```bash
# 1. Acessar http://localhost:3000
# 2. Fazer login com:
#    Email: admin@gmail.com
#    Senha: 34762414
# 3. Verificar acesso ao painel /admin
```

### Middleware de Admin
- [ ] Verificar em `backend/src/middleware/admin.js`
  - Checa req.user.is_admin ✅
  - Retorna 403 se não for admin ✅

- [ ] Verificar rotas admin em `backend/src/routes/admin.routes.js`
  - Todas usam authenticateToken ✅
  - Todas usam requireAdmin ✅
  - Rate limiting aplicado ✅

---

## 💳 VERIFICAÇÕES DE GATEWAY DE PAGAMENTO

### Configuração Pulse VIP
- [ ] Verificar em `.env` ou `docker-compose.yml`
  - PULSE_CLIENT_ID configurado ✅
  - PULSE_API_KEY configurado ✅
  - PULSE_BASE_URL configurado ✅
  - PULSE_WEBHOOK_URL configurado ✅

- [ ] Verificar em `backend/src/config/pulse.js`
  - Headers corretos (X-Client-Id, X-API-Key) ✅
  - Base URL correto ✅

- [ ] Verificar em `database/init.sql`
  - Gateway config inserido na tabela ✅

**Como testar conexão:**
```bash
# No container do backend
curl -X POST https://pulsepayment.app.br/api/v1/test \
  -H "X-Client-Id: e1c98954cc404cbcb2868af9b40c7a33" \
  -H "X-API-Key: 4XJoHefFKOr593cnD5_xCto1FfzbQYtvfS2Il6aPAY2nyt8Vm-Qi_NoZ8VhyVocfuCloLEfNBb-7sKjGxFH-0A"
```

### Integração de Depósito
- [ ] Verificar `backend/src/services/pulseService.js` - função `pulseCreatePix`
  - Cria transação no BD antes da chamada API ✅
  - Envia dados corretos para Pulse VIP ✅
  - Atualiza transação com gateway_transaction_id ✅
  - Registra log no gateway_logs ✅
  - Retorna QR code ✅

### Integração de Saque
- [ ] Verificar `backend/src/services/pulseService.js` - função `pulseWithdraw`
  - Calcula taxa corretamente (15%) ✅
  - Cria transação no BD ✅
  - Envia dados corretos para Pulse VIP ✅
  - Atualiza status da transação ✅
  - Registra log no gateway_logs ✅

### Webhook
- [ ] Verificar `backend/src/controllers/webhookController.js`
  - Recebe notificações do Pulse VIP ✅
  - Valida payload ✅
  - Encontra transação por gateway_transaction_id ✅
  - Atualiza status da transação ✅
  - Credita saldo (net_amount) para depósitos ✅
  - Registra log ✅

**Como testar webhook:**
```bash
# Simular webhook do Pulse VIP
curl -X POST http://localhost:5000/api/webhook/pulse \
  -H "Content-Type: application/json" \
  -d '{
    "event": "transaction.completed",
    "transaction_id": "abc123",
    "status": "completed",
    "amount": 100.00,
    "customer_email": "user@example.com"
  }'
```

---

## 🗄️ VERIFICAÇÕES DE BANCO DE DADOS

### Conexão
- [ ] PostgreSQL rodando
  ```bash
  docker ps | grep nibanky_postgres
  ```

- [ ] Variável DATABASE_URL configurada
  ```bash
  echo $DATABASE_URL
  ```

- [ ] Conexão funcionando
  ```bash
  docker exec -it nibanky_postgres psql -U nibanky_user -d nibanky -c "SELECT 1;"
  ```

### Tabelas
- [ ] Todas as tabelas criadas:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
  ```
  - users ✅
  - transactions ✅
  - kyc_documents ✅
  - gateway_logs ✅
  - gateway_config ✅

### Admin User
- [ ] Admin inserido:
  ```sql
  SELECT email, is_admin, kyc_status FROM users WHERE email = 'admin@gmail.com';
  ```

---

## 🌐 VERIFICAÇÕES DE FRONTEND

### Páginas de Admin
- [ ] `/admin` - Dashboard acessível
- [ ] `/admin/users` - Lista de usuários
- [ ] `/admin/kyc` - Aprovação de KYC
- [ ] `/admin/transactions` - Monitoramento
- [ ] `/admin/gateway` - Configuração
- [ ] `/admin/logs` - Logs do gateway

**Como testar:**
```bash
# 1. Login como admin
# 2. Acessar cada URL acima
# 3. Verificar se não há erros 403/404
```

### Exibição de Taxas
- [ ] Página de saque mostra taxa de 15%
- [ ] Página de depósito informa taxa de 2%
- [ ] Cálculos de valor líquido corretos

---

## 🔧 VERIFICAÇÕES DE AMBIENTE

### Variáveis de Ambiente (.env)
```bash
# Verificar se todas estão definidas:
- DATABASE_URL ✅
- JWT_SECRET ✅
- JWT_EXPIRES_IN ✅
- PULSE_CLIENT_ID ✅
- PULSE_API_KEY ✅
- PULSE_BASE_URL ✅
- PULSE_WEBHOOK_URL ✅
- PORT ✅
- NODE_ENV ✅
- FRONTEND_URL ✅
```

### Docker Compose
- [ ] Todos os serviços rodando:
  ```bash
  docker-compose ps
  ```
  - postgres ✅
  - backend ✅
  - frontend ✅

- [ ] Health checks passando:
  ```bash
  docker inspect nibanky_postgres | grep -A 5 "Health"
  ```

---

## 🚀 VERIFICAÇÕES PARA PRODUÇÃO

### Segurança
- [ ] JWT_SECRET alterado do valor padrão
- [ ] Senhas fortes para banco de dados
- [ ] HTTPS configurado
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo

### Performance
- [ ] Índices de banco de dados criados
- [ ] Logs configurados (Winston)
- [ ] Conexão do BD otimizada (pool)

### Monitoramento
- [ ] Gateway logs sendo registrados
- [ ] Erros sendo logados
- [ ] Métricas de transação disponíveis

---

## ❌ ERROS COMUNS E SOLUÇÕES

### 1. Taxa incorreta sendo aplicada
**Erro:** Saque cobra 2% em vez de 15%
**Solução:**
```bash
# Verificar valores em:
backend/src/services/pulseService.js (linha 108)
backend/src/controllers/transactionController.js (linha 147)
```

### 2. Admin não consegue fazer login
**Erro:** "Invalid credentials"
**Solução:**
```sql
-- Verificar se admin existe
SELECT * FROM users WHERE email = 'admin@gmail.com';

-- Se não existir, inserir:
INSERT INTO users (email, password_hash, full_name, cpf, phone, kyc_status, is_admin, is_active)
VALUES ('admin@gmail.com', '$2b$10$e7731L9Hr2VwSYcJQM1GcOo1RV38XgW8scW17doPXRelhrFXGQ.S2', 
        'Administrador do Sistema', '00000000000', '00000000000', 'approved', true, true);
```

### 3. Gateway não responde
**Erro:** "Failed to create PIX payment"
**Solução:**
```bash
# Verificar credenciais
echo $PULSE_CLIENT_ID
echo $PULSE_API_KEY

# Verificar conectividade
curl -I https://pulsepayment.app.br

# Verificar logs
docker-compose logs backend | grep -i pulse
```

### 4. Webhook não funciona
**Erro:** Depósito não credita automaticamente
**Solução:**
```bash
# Verificar URL do webhook
echo $PULSE_WEBHOOK_URL

# Verificar logs de webhook
SELECT * FROM gateway_logs WHERE type = 'webhook' ORDER BY created_at DESC LIMIT 10;

# Testar webhook manualmente (ver seção acima)
```

### 5. Banco de dados não conecta
**Erro:** "Database connection failed"
**Solução:**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs
docker-compose logs postgres

# Reiniciar se necessário
docker-compose restart postgres
```

---

## 📊 TESTES COMPLETOS

### Fluxo de Depósito Completo
1. [ ] Usuário faz login
2. [ ] KYC aprovado
3. [ ] Solicita depósito de R$ 100
4. [ ] Sistema gera QR Code
5. [ ] QR Code válido (não expirado)
6. [ ] Webhook recebe confirmação
7. [ ] Saldo creditado: R$ 98 (taxa de 2%)
8. [ ] Transação marcada como "completed"
9. [ ] Log registrado

### Fluxo de Saque Completo
1. [ ] Usuário faz login
2. [ ] KYC aprovado
3. [ ] Saldo suficiente (R$ 100 + R$ 15 taxa)
4. [ ] Solicita saque de R$ 100
5. [ ] Taxa calculada: R$ 15
6. [ ] Total debitado: R$ 115
7. [ ] Saque processado pelo gateway
8. [ ] Transação marcada como "completed"
9. [ ] Log registrado
10. [ ] PIX recebido na chave informada

### Fluxo de Admin
1. [ ] Login com admin@gmail.com / 34762414
2. [ ] Acesso ao painel /admin
3. [ ] Visualizar estatísticas
4. [ ] Listar usuários
5. [ ] Aprovar KYC de usuário
6. [ ] Visualizar transações
7. [ ] Ver logs do gateway
8. [ ] Configurar gateway

---

## ✅ CHECKLIST FINAL ANTES DE HOSPEDAR

- [ ] Todas as taxas corretas (saque 15%, depósito 2%)
- [ ] Admin padrão criado e funcional
- [ ] Gateway Pulse VIP integrado e testado
- [ ] Webhook funcionando corretamente
- [ ] Todas as variáveis de ambiente configuradas
- [ ] JWT_SECRET alterado para produção
- [ ] HTTPS configurado
- [ ] Domínio configurado
- [ ] Backup de banco de dados configurado
- [ ] Logs sendo salvos
- [ ] Monitoramento ativo
- [ ] Documentação atualizada
- [ ] README com instruções de deploy

---

## 📞 CONTATOS DE SUPORTE

**Banco de Dados:** Verificar logs em `docker-compose logs postgres`
**Backend:** Verificar logs em `docker-compose logs backend`
**Frontend:** Verificar logs em `docker-compose logs frontend`

**Documentação:**
- README.md
- QUICKSTART_PT.md
- API_DOCUMENTATION.md
- DEPLOYMENT.md (a criar)

---

**Última atualização:** 2026-02-15
**Versão:** 1.0.0
