# API Documentation - Nibanky Backend

Base URL: `http://localhost:5000`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "João Silva",
  "cpf": "12345678900",
  "phone": "11999999999"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "João Silva",
    "cpf": "12345678900",
    "phone": "11999999999",
    "balance": 0,
    "kyc_status": "pending"
  },
  "token": "jwt_token"
}
```

### Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt_token"
}
```

### Logout
**POST** `/api/auth/logout`

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

## 👤 User Endpoints

### Get Profile
**GET** `/api/user/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "João Silva",
  "cpf": "12345678900",
  "phone": "11999999999",
  "balance": 1000.50,
  "kyc_status": "approved",
  "is_admin": false,
  "is_active": true
}
```

### Update Profile
**PUT** `/api/user/profile`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "full_name": "João Silva Santos",
  "phone": "11988888888"
}
```

### Get Balance
**GET** `/api/user/balance`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "balance": 1000.50
}
```

### Change Password
**POST** `/api/user/change-password`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass123"
}
```

---

## 💸 Transaction Endpoints

### List Transactions
**GET** `/api/transactions?limit=50&offset=0&type=deposit&status=completed`

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)
- `type` (optional): deposit, withdrawal, pix_sent, pix_received
- `status` (optional): pending, completed, failed, cancelled

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "user_email": "user@example.com",
      "type": "deposit",
      "amount": 100.00,
      "fee": 0.00,
      "net_amount": 100.00,
      "status": "completed",
      "created_at": "2026-02-15T07:00:00Z"
    }
  ]
}
```

### Get Transaction
**GET** `/api/transactions/:id`

**Headers:** `Authorization: Bearer <token>`

### Create Deposit
**POST** `/api/transactions/deposit`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "amount": 100.00
}
```

**Response:**
```json
{
  "transaction": { ... },
  "qr_code": "00020126...",
  "qr_code_image": "data:image/png;base64,...",
  "expires_at": "2026-02-15T08:00:00Z"
}
```

### Create Withdrawal
**POST** `/api/transactions/withdraw`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "amount": 100.00,
  "pix_key": "12345678900",
  "pix_key_type": "cpf"
}
```

**Response:**
```json
{
  "transaction": { ... },
  "withdrawal_id": "gateway_id",
  "status": "completed",
  "net_amount": 98.00
}
```

### Create PIX Transfer
**POST** `/api/transactions/pix`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "recipient_email": "recipient@example.com",
  "amount": 50.00,
  "description": "Pagamento"
}
```

### Get Statistics
**GET** `/api/transactions/stats`

**Headers:** `Authorization: Bearer <token>`

---

## 📝 KYC Endpoints

### Submit KYC
**POST** `/api/kyc/submit`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "document_type": "rg",
  "document_front_url": "data:image/jpeg;base64,...",
  "document_back_url": "data:image/jpeg;base64,...",
  "selfie_url": "data:image/jpeg;base64,...",
  "full_name": "João Silva",
  "cpf": "12345678900",
  "birth_date": "1990-01-01"
}
```

### Get KYC Status
**GET** `/api/kyc/status`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "status": "approved",
  "document_type": "rg",
  "created_at": "2026-02-15T07:00:00Z"
}
```

---

## 🔧 Admin Endpoints

All admin endpoints require `is_admin: true` in the user account.

### Dashboard Statistics
**GET** `/api/admin/stats`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "total_users": 100,
  "total_transactions": 500,
  "total_volume": 50000.00,
  "pending_kycs": 5
}
```

### List Users
**GET** `/api/admin/users?limit=50&offset=0&kyc_status=approved`

**Headers:** `Authorization: Bearer <token>`

### Get User
**GET** `/api/admin/users/:id`

**Headers:** `Authorization: Bearer <token>`

### Update User
**PUT** `/api/admin/users/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "balance": 1000.00,
  "kyc_status": "approved",
  "is_active": true
}
```

### List KYCs
**GET** `/api/admin/kyc?status=pending&limit=50&offset=0`

**Headers:** `Authorization: Bearer <token>`

### Approve KYC
**PUT** `/api/admin/kyc/:id/approve`

**Headers:** `Authorization: Bearer <token>`

### Reject KYC
**PUT** `/api/admin/kyc/:id/reject`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "rejection_reason": "Documento ilegível"
}
```

### List All Transactions
**GET** `/api/admin/transactions?limit=50&offset=0&type=deposit&status=completed`

**Headers:** `Authorization: Bearer <token>`

### Cancel Transaction
**PUT** `/api/admin/transactions/:id/cancel`

**Headers:** `Authorization: Bearer <token>`

### Get Gateway Configuration
**GET** `/api/admin/gateway`

**Headers:** `Authorization: Bearer <token>`

### Update Gateway Configuration
**PUT** `/api/admin/gateway/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "api_key": "new_key",
  "api_secret": "new_secret",
  "webhook_url": "https://newurl.com/webhook",
  "is_active": true,
  "environment": "production"
}
```

### List Gateway Logs
**GET** `/api/admin/logs?limit=50&offset=0&type=pix_create&status=success`

**Headers:** `Authorization: Bearer <token>`

---

## 🔔 Webhook

### Pulse VIP Webhook
**POST** `/api/webhook/pulse`

**Body:**
```json
{
  "event": "transaction.completed",
  "transaction_id": "gateway_transaction_id",
  "status": "completed",
  "amount": 100.00,
  "customer_email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Webhook processed successfully"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error
