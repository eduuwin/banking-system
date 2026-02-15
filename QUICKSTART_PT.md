# 🚀 Guia Rápido - Como Rodar o Projeto Nibanky

Este guia vai te ajudar a rodar o projeto Nibanky em menos de 5 minutos!

## 📋 Antes de Começar

Você precisa ter instalado:
- **Docker** e **Docker Compose** (Recomendado - Mais fácil!)
  - [Instalar Docker Desktop](https://www.docker.com/products/docker-desktop)
  - OU
- **Node.js 18+** e **PostgreSQL 15** (Para desenvolvimento)

## 🎯 Opção 1: Rodar com Docker (RECOMENDADO)

### Passo 1: Clone o Repositório
```bash
git clone https://github.com/eduuwin/banking-system.git
cd banking-system
```

### Passo 2: Inicie o Sistema
```bash
docker-compose up --build
```

**Pronto! 🎉** O sistema vai:
1. Baixar as imagens necessárias
2. Instalar todas as dependências
3. Criar o banco de dados
4. Iniciar os 3 serviços (frontend, backend, database)

### Passo 3: Acesse o Sistema
Aguarde cerca de 2-3 minutos para tudo inicializar, depois acesse:

- **🌐 Frontend (Interface):** http://localhost:3000
- **🔧 Backend (API):** http://localhost:5000
- **💾 Banco de Dados:** localhost:5432

### Passo 4: Teste a API
Abra seu navegador em: http://localhost:5000/health

Você deve ver: `{"status":"ok","timestamp":"..."}`

---

## 🎯 Opção 2: Rodar Localmente (Desenvolvimento)

### Passo 1: Clone e Configure
```bash
git clone https://github.com/eduuwin/banking-system.git
cd banking-system
cp .env.example .env
```

### Passo 2: Configure o Banco de Dados
```bash
# Inicie o PostgreSQL (se não estiver rodando)
# No Linux/Mac:
sudo systemctl start postgresql

# Ou use Docker apenas para o banco:
docker run --name nibanky-postgres -e POSTGRES_PASSWORD=nibanky_pass -e POSTGRES_USER=nibanky_user -e POSTGRES_DB=nibanky -p 5432:5432 -d postgres:15-alpine

# Crie o banco de dados
psql -U postgres -c "CREATE DATABASE nibanky;"
psql -U nibanky_user -d nibanky -f database/init.sql
```

### Passo 3: Inicie o Backend
```bash
cd backend
npm install
npm start
```

O backend estará rodando em: http://localhost:5000

### Passo 4: Inicie o Frontend (Em outro terminal)
```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em: http://localhost:3000

---

## 📱 Primeiro Acesso

1. Abra o navegador em **http://localhost:3000**
2. Clique em **"Criar conta"**
3. Preencha:
   - Email: seu@email.com
   - Senha: sua_senha_segura
   - Nome completo: Seu Nome
   - CPF: 12345678900 (apenas números)
   - Telefone: 11999999999 (apenas números)
4. Clique em **"Cadastrar"**
5. Faça login com seu email e senha

### 🔑 Criar um Usuário Admin (Opcional)

Para acessar o painel administrativo:

```bash
# Entre no container do PostgreSQL
docker exec -it nibanky_postgres psql -U nibanky_user -d nibanky

# Execute o comando SQL
UPDATE users SET is_admin = true WHERE email = 'seu@email.com';

# Saia do PostgreSQL
\q
```

Agora você pode acessar: http://localhost:3000/admin

---

## 🛠️ Comandos Úteis

### Docker Compose

```bash
# Iniciar o sistema
docker-compose up

# Iniciar em background (segundo plano)
docker-compose up -d

# Ver os logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar o sistema
docker-compose down

# Parar e remover tudo (incluindo volumes)
docker-compose down -v

# Reconstruir tudo do zero
docker-compose up --build --force-recreate
```

### Verificar Status

```bash
# Ver containers rodando
docker ps

# Ver portas em uso
docker-compose ps
```

---

## ❌ Problemas Comuns e Soluções

### 1. Porta já em uso

**Erro:** `Error: bind: address already in use`

**Solução:**
```bash
# Descubra qual processo está usando a porta
# Linux/Mac:
lsof -i :3000
lsof -i :5000
lsof -i :5432

# Windows (PowerShell):
netstat -ano | findstr :3000

# Pare o processo ou mude a porta no docker-compose.yml
```

### 2. Docker não está rodando

**Erro:** `Cannot connect to the Docker daemon`

**Solução:**
- Inicie o Docker Desktop
- Linux: `sudo systemctl start docker`

### 3. Permissão negada

**Erro:** `permission denied`

**Solução:**
```bash
# Linux/Mac - adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER
# Depois faça logout e login novamente
```

### 4. Banco de dados não conecta

**Erro:** `Database connection failed`

**Solução:**
```bash
# Verifique se o PostgreSQL está rodando
docker-compose ps

# Reinicie apenas o banco
docker-compose restart postgres

# Veja os logs do banco
docker-compose logs postgres
```

### 5. Frontend não carrega

**Erro:** Página em branco ou erro de conexão

**Solução:**
```bash
# Verifique se o backend está rodando
curl http://localhost:5000/health

# Reconstrua o frontend
docker-compose up --build frontend
```

### 6. Módulos não encontrados

**Erro:** `Cannot find module...`

**Solução:**
```bash
# Reconstrua tudo
docker-compose down
docker-compose up --build
```

### 7. EADDRINUSE: address already in use

**Solução:**
```bash
# Pare todos os containers
docker-compose down

# Mate processos nas portas
# Linux/Mac:
sudo kill -9 $(lsof -ti:3000)
sudo kill -9 $(lsof -ti:5000)
sudo kill -9 $(lsof -ti:5432)

# Inicie novamente
docker-compose up
```

---

## 🔍 Verificar se está Tudo Funcionando

Execute estes testes rápidos:

### 1. Backend (API)
```bash
curl http://localhost:5000/health
```
Esperado: `{"status":"ok",...}`

### 2. Frontend
Abra: http://localhost:3000
Esperado: Ver a tela de login

### 3. Banco de Dados
```bash
docker exec -it nibanky_postgres psql -U nibanky_user -d nibanky -c "SELECT COUNT(*) FROM users;"
```
Esperado: Ver um número (0 se não tiver usuários)

---

## 📊 Estrutura de Pastas

```
banking-system/
├── backend/           # API Node.js/Express
│   ├── src/          # Código fonte
│   └── package.json  # Dependências
├── frontend/          # Interface React
│   ├── src/          # Código fonte
│   └── package.json  # Dependências
├── database/          # Scripts SQL
│   ├── init.sql      # Inicialização
│   └── migrations/   # Migrações
├── docker-compose.yml # Configuração Docker
└── README.md         # Documentação completa
```

---

## 🎓 Próximos Passos

1. **Leia a documentação completa:** [README.md](./README.md)
2. **Explore a API:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. **Entenda a arquitetura:** [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Veja o resumo:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 💬 Precisa de Ajuda?

- 📖 Documentação completa: [README.md](./README.md)
- 🐛 Reportar problemas: [GitHub Issues](https://github.com/eduuwin/banking-system/issues)
- 💡 Sugestões: Abra uma issue ou pull request

---

## ⚡ Atalhos Rápidos

| Comando | Descrição |
|---------|-----------|
| `docker-compose up` | Inicia tudo |
| `docker-compose down` | Para tudo |
| `docker-compose logs -f` | Ver logs em tempo real |
| `docker-compose restart backend` | Reinicia só o backend |
| `docker ps` | Ver o que está rodando |
| `docker-compose ps` | Status dos serviços |

---

**Dica:** Mantenha o Docker Desktop aberto enquanto desenvolve!

**🎉 Parabéns!** Você conseguiu rodar o Nibanky! 

Agora explore as funcionalidades:
- Crie uma conta
- Faça KYC
- Teste depósitos e saques PIX
- Explore o painel admin
