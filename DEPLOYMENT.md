# 🚀 GUIA DE HOSPEDAGEM - Sistema Nibanky

Este guia contém todas as instruções para hospedar o sistema bancário Nibanky em produção.

---

## 📋 PRÉ-REQUISITOS

### Servidor
- **RAM:** Mínimo 2GB, Recomendado 4GB+
- **CPU:** Mínimo 2 cores
- **Disco:** Mínimo 20GB SSD
- **OS:** Ubuntu 20.04+ ou similar

### Software Necessário
- Docker 20.10+
- Docker Compose 1.29+
- Git
- SSL/TLS (Let's Encrypt recomendado)

---

## 🔧 CONFIGURAÇÃO DO SERVIDOR

### 1. Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Docker
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### 3. Configurar Firewall
```bash
# Permitir SSH, HTTP e HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📦 DEPLOY DA APLICAÇÃO

### 1. Clonar Repositório
```bash
cd /opt
sudo git clone https://github.com/eduuwin/banking-system.git
cd banking-system
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar exemplo
cp .env.example .env

# Editar variáveis (IMPORTANTE!)
nano .env
```

**Variáveis Críticas para Produção:**
```env
# Database - ALTERE A SENHA!
DATABASE_URL=postgresql://nibanky_user:SUA_SENHA_FORTE_AQUI@postgres:5432/nibanky

# JWT - ALTERE O SECRET!
JWT_SECRET=seu_jwt_secret_muito_seguro_e_aleatorio_aqui
JWT_EXPIRES_IN=7d

# Pulse VIP Gateway
PULSE_CLIENT_ID=e1c98954cc404cbcb2868af9b40c7a33
PULSE_API_KEY=4XJoHefFKOr593cnD5_xCto1FfzbQYtvfS2Il6aPAY2nyt8Vm-Qi_NoZ8VhyVocfuCloLEfNBb-7sKjGxFH-0A
PULSE_BASE_URL=https://pulsepayment.app.br
PULSE_WEBHOOK_URL=https://seu-dominio.com/api/webhook/pulse

# Server
PORT=5000
NODE_ENV=production

# Frontend URL - ALTERE PARA SEU DOMÍNIO!
FRONTEND_URL=https://seu-dominio.com
```

### 3. Atualizar docker-compose.yml para Produção
```bash
nano docker-compose.yml
```

**Alterações necessárias:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: nibanky_postgres
    environment:
      POSTGRES_DB: nibanky
      POSTGRES_USER: nibanky_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}  # Da variável .env
    ports:
      - "127.0.0.1:5432:5432"  # Não expor publicamente!
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nibanky_user -d nibanky"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: nibanky_backend
    ports:
      - "127.0.0.1:5000:5000"  # Não expor publicamente!
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
      PULSE_CLIENT_ID: ${PULSE_CLIENT_ID}
      PULSE_API_KEY: ${PULSE_API_KEY}
      PULSE_BASE_URL: ${PULSE_BASE_URL}
      PULSE_WEBHOOK_URL: ${PULSE_WEBHOOK_URL}
      PORT: 5000
      NODE_ENV: production
      FRONTEND_URL: ${FRONTEND_URL}
    depends_on:
      postgres:
        condition: service_healthy
    restart: always

  frontend:
    build: 
      context: ./frontend
      args:
        VITE_API_URL: ${FRONTEND_URL}
    container_name: nibanky_frontend
    ports:
      - "127.0.0.1:3000:3000"  # Não expor publicamente!
    environment:
      VITE_API_URL: ${FRONTEND_URL}
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

### 4. Build e Start
```bash
# Build das imagens
sudo docker-compose build

# Iniciar serviços
sudo docker-compose up -d

# Verificar status
sudo docker-compose ps

# Ver logs
sudo docker-compose logs -f
```

---

## 🔒 CONFIGURAR NGINX + SSL

### 1. Instalar Nginx
```bash
sudo apt install nginx -y
```

### 2. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/nibanky
```

**Configuração:**
```nginx
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Frontend
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # SSL - será configurado pelo Certbot
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout para operações longas
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 3. Ativar Site
```bash
sudo ln -s /etc/nginx/sites-available/nibanky /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Instalar SSL com Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

---

## 🗄️ BACKUP DO BANCO DE DADOS

### Script de Backup Automático
```bash
sudo nano /opt/backup-nibanky.sh
```

**Conteúdo:**
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/nibanky"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="nibanky_postgres"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Fazer backup
docker exec $CONTAINER pg_dump -U nibanky_user nibanky | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup concluído: backup_$DATE.sql.gz"
```

**Tornar executável e agendar:**
```bash
sudo chmod +x /opt/backup-nibanky.sh

# Adicionar ao crontab (backup diário às 2h)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-nibanky.sh") | crontab -
```

---

## 📊 MONITORAMENTO

### 1. Ver Logs em Tempo Real
```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend

# Apenas banco
docker-compose logs -f postgres
```

### 2. Verificar Status
```bash
# Status dos containers
docker-compose ps

# Recursos utilizados
docker stats

# Health check do banco
docker exec nibanky_postgres pg_isready -U nibanky_user
```

### 3. Acessar Logs do Nginx
```bash
# Logs de acesso
sudo tail -f /var/log/nginx/access.log

# Logs de erro
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 ATUALIZAÇÃO DA APLICAÇÃO

### Atualizar Código
```bash
cd /opt/banking-system

# Fazer backup do banco antes
/opt/backup-nibanky.sh

# Parar serviços
docker-compose down

# Atualizar código
git pull origin main

# Rebuild
docker-compose build

# Iniciar
docker-compose up -d

# Verificar
docker-compose ps
docker-compose logs -f
```

---

## ⚠️ TROUBLESHOOTING

### Problema: Container não inicia
```bash
# Ver logs
docker-compose logs [service_name]

# Verificar portas
sudo netstat -tlnp | grep -E ':(3000|5000|5432)'

# Reiniciar
docker-compose restart [service_name]
```

### Problema: Banco de dados não conecta
```bash
# Verificar se está rodando
docker exec nibanky_postgres pg_isready -U nibanky_user

# Conectar manualmente
docker exec -it nibanky_postgres psql -U nibanky_user -d nibanky

# Verificar logs
docker-compose logs postgres
```

### Problema: SSL não funciona
```bash
# Testar configuração do Nginx
sudo nginx -t

# Verificar certificados
sudo certbot certificates

# Renovar manualmente se necessário
sudo certbot renew
```

---

## ✅ CHECKLIST FINAL DE PRODUÇÃO

- [ ] Servidor configurado e atualizado
- [ ] Docker e Docker Compose instalados
- [ ] Firewall configurado (portas 80, 443, SSH)
- [ ] Aplicação clonada em /opt/banking-system
- [ ] Variáveis .env configuradas com valores de produção
- [ ] JWT_SECRET alterado e seguro
- [ ] DATABASE_PASSWORD alterado e seguro
- [ ] docker-compose.yml atualizado para produção
- [ ] Portas não expostas publicamente (apenas via Nginx)
- [ ] Nginx instalado e configurado
- [ ] Domínio apontando para o servidor
- [ ] SSL/TLS configurado com Let's Encrypt
- [ ] Backup automático configurado
- [ ] Aplicação rodando (docker-compose ps)
- [ ] Frontend acessível via HTTPS
- [ ] Backend respondendo via /api
- [ ] Login admin funcionando (admin@gmail.com)
- [ ] Taxa de saque 15% ativa
- [ ] Taxa de depósito 2% ativa
- [ ] Gateway Pulse VIP integrado
- [ ] Webhook configurado e funcionando
- [ ] Logs sendo salvos corretamente
- [ ] Monitoramento ativo

---

## 🔐 SEGURANÇA ADICIONAL

### Proteção DDoS
```bash
# Instalar fail2ban
sudo apt install fail2ban -y

# Configurar para Nginx
sudo nano /etc/fail2ban/jail.local
```

### Limitação de Taxa no Nginx
```nginx
# Adicionar ao bloco http em /etc/nginx/nginx.conf
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

# No bloco server, adicionar:
location /api/auth/login {
    limit_req zone=login_limit burst=5 nodelay;
    proxy_pass http://127.0.0.1:5000;
}

location /api {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://127.0.0.1:5000;
}
```

---

## 📞 CONTATOS E SUPORTE

**Documentação:**
- [README.md](./README.md)
- [QUICKSTART_PT.md](./QUICKSTART_PT.md)
- [CHECKLIST_ERRORS.md](./CHECKLIST_ERRORS.md)

**Comandos Úteis:**
```bash
# Status geral
docker-compose ps && docker stats --no-stream

# Logs resumidos
docker-compose logs --tail=100

# Reiniciar tudo
docker-compose restart

# Parar tudo
docker-compose down

# Limpar volumes (CUIDADO!)
docker-compose down -v
```

---

**Versão:** 1.0.0
**Última atualização:** 2026-02-15

**🎉 Parabéns! Seu sistema está pronto para produção!**
