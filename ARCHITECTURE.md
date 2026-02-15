# Nibanky System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NIBANKY BANKING SYSTEM                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                           USERS                                   │
│  👤 Regular Users          |          👨‍💼 Administrators          │
└──────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌──────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │  User Pages │  │   Components  │  │    Admin Pages      │     │
│  │  (11 pages) │  │  (8 comps)   │  │    (6 pages)        │     │
│  └─────────────┘  └──────────────┘  └─────────────────────┘     │
│         │               │                      │                  │
│         └───────────────┴──────────────────────┘                  │
│                         │                                         │
│                 ┌───────────────┐                                │
│                 │   Services    │                                │
│                 │  (API Layer)  │                                │
│                 └───────────────┘                                │
│  Port: 3000          │                                           │
└──────────────────────┼───────────────────────────────────────────┘
                       │ HTTP/REST
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    API ENDPOINTS (30+)                     │  │
│  │  /api/auth  /api/user  /api/transactions  /api/kyc       │  │
│  │  /api/admin  /api/webhook                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            │                                      │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │  Middleware  │   │ Controllers  │   │   Services   │        │
│  │  • Auth      │   │  • User      │   │  • Pulse VIP │        │
│  │  • RateLimit │   │  • Txn       │   │  • Logging   │        │
│  │  • Admin     │   │  • KYC       │   │              │        │
│  │  • Error     │   │  • Admin     │   │              │        │
│  └──────────────┘   └──────────────┘   └──────────────┘        │
│                            │                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      MODELS                               │  │
│  │  User | Transaction | KYCDocument | GatewayLog | Config  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Port: 5000                │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ PostgreSQL Protocol
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL 15)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      5 TABLES                             │  │
│  │  • users          - User accounts & balance               │  │
│  │  • transactions   - Transaction history                   │  │
│  │  • kyc_documents  - KYC verification                      │  │
│  │  • gateway_logs   - Gateway integration logs              │  │
│  │  • gateway_config - Gateway configuration                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Port: 5432                                                      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              EXTERNAL INTEGRATION                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 PULSE VIP GATEWAY                         │  │
│  │                                                            │  │
│  │  POST /api/v1/transactions  - Create PIX                 │  │
│  │  POST /api/v1/withdrawals   - Process withdrawal         │  │
│  │  POST /webhook/pulse        - Payment confirmation       │  │
│  │                                                            │  │
│  │  Authentication:                                          │  │
│  │  • X-Client-Id: e1c98954cc404cbcb2868af9b40c7a33        │  │
│  │  • X-API-Key: 4XJoH...                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  URL: https://pulsepayment.app.br                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT (Docker Compose)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │  Container  │  │  Container  │  │     Container       │     │
│  │  Frontend   │  │  Backend    │  │    PostgreSQL       │     │
│  │  (nginx)    │  │  (node:18)  │  │   (postgres:15)     │     │
│  │  Port: 3000 │  │  Port: 5000 │  │    Port: 5432       │     │
│  └─────────────┘  └─────────────┘  └─────────────────────┘     │
│                                                                   │
│  Volumes: postgres_data (persistent)                             │
│  Network: nibanky-network (internal)                             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Rate Limiting                                         │  │
│  │     • Auth: 5 requests per 15 minutes                    │  │
│  │     • Transactions: 20 requests per 15 minutes           │  │
│  │     • General API: 100 requests per 15 minutes           │  │
│  │                                                            │  │
│  │  2. Authentication & Authorization                        │  │
│  │     • JWT tokens (7-day expiration)                      │  │
│  │     • Bcrypt password hashing (10 rounds)                │  │
│  │     • Role-based access control (user/admin)             │  │
│  │                                                            │  │
│  │  3. Input Validation                                      │  │
│  │     • CPF validation (check digits)                      │  │
│  │     • Email, phone, amount validation                    │  │
│  │     • SQL parameterized queries                          │  │
│  │                                                            │  │
│  │  4. CORS & Environment                                    │  │
│  │     • Configured CORS whitelist                          │  │
│  │     • Environment variables for secrets                  │  │
│  │     • Error messages without sensitive data              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  CodeQL Analysis: ✅ 0 Vulnerabilities Found                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                  │
│                                                                   │
│  DEPOSIT FLOW:                                                   │
│  User → Frontend → Backend → Pulse VIP → Generate QR Code       │
│       ← ← ← ← ← ← ← ← ← ← ← ← ← Return QR Code                 │
│  User pays PIX → Pulse VIP → Webhook → Backend → Update DB      │
│                                                                   │
│  WITHDRAWAL FLOW:                                                │
│  User → Frontend → Backend (validate) → Pulse VIP → Process     │
│       ← ← ← ← ← ← ← ← ← ← ← Confirmation                        │
│  Backend → Update Balance → Save Transaction                     │
│                                                                   │
│  INTERNAL TRANSFER:                                              │
│  User A → Backend → Validate → Debit A → Credit B → Confirm     │
│                                                                   │
│  KYC APPROVAL:                                                   │
│  User → Submit Docs → Admin Reviews → Approve/Reject            │
│       → Update kyc_status → User can transact                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    PROJECT STATISTICS                             │
│                                                                   │
│  Total Files: 69                                                 │
│  Backend: 30 files (184KB)                                       │
│  Frontend: 33 files (320KB)                                      │
│  Database: 6 files (40KB)                                        │
│  Lines of Code: ~8,000+                                          │
│                                                                   │
│  API Endpoints: 30+                                              │
│  Pages: 17 (11 user + 6 admin)                                  │
│  Components: 8 reusable                                          │
│  Database Tables: 5                                              │
│                                                                   │
│  Security: ✅ 0 Vulnerabilities (CodeQL)                         │
│  Documentation: ✅ 3 comprehensive files                         │
│  Status: ✅ Production Ready                                     │
└──────────────────────────────────────────────────────────────────┘
```

## Quick Command Reference

```bash
# Start the system
docker-compose up --build

# Stop the system
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Access database
docker exec -it nibanky_postgres psql -U nibanky_user -d nibanky

# Create admin user
UPDATE users SET is_admin = true WHERE email = 'your@email.com';

# Check running containers
docker ps

# Rebuild specific service
docker-compose up --build backend
```

## URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **Database:** postgresql://nibanky_user:nibanky_pass@localhost:5432/nibanky
