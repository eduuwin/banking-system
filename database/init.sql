-- Initialize Nibanky Database
-- This file contains all migrations in order

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Migration 001: Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected')),
    is_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

-- Migration 002: Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'pix_sent', 'pix_received')),
    amount DECIMAL(15, 2) NOT NULL,
    fee DECIMAL(15, 2) DEFAULT 0.00,
    net_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    pix_key VARCHAR(255),
    pix_key_type VARCHAR(20) CHECK (pix_key_type IN ('cpf', 'email', 'phone', 'random')),
    recipient_name VARCHAR(255),
    description TEXT,
    gateway_transaction_id VARCHAR(255),
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_email ON transactions(user_email);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_gateway_id ON transactions(gateway_transaction_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Migration 003: Create kyc_documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('rg', 'cnh')),
    document_front_url TEXT NOT NULL,
    document_back_url TEXT NOT NULL,
    selfie_url TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    birth_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kyc_user_email ON kyc_documents(user_email);
CREATE INDEX idx_kyc_status ON kyc_documents(status);
CREATE INDEX idx_kyc_created_at ON kyc_documents(created_at DESC);

-- Migration 004: Create gateway_logs table
CREATE TABLE IF NOT EXISTS gateway_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('pix_create', 'withdraw', 'webhook', 'error')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'pending')),
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    gateway_id VARCHAR(255),
    user_email VARCHAR(255),
    amount DECIMAL(15, 2),
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gateway_logs_type ON gateway_logs(type);
CREATE INDEX idx_gateway_logs_status ON gateway_logs(status);
CREATE INDEX idx_gateway_logs_transaction_id ON gateway_logs(transaction_id);
CREATE INDEX idx_gateway_logs_created_at ON gateway_logs(created_at DESC);

-- Migration 005: Create gateway_config table
CREATE TABLE IF NOT EXISTS gateway_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    api_key TEXT NOT NULL,
    api_secret TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    pix_key VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    environment VARCHAR(20) DEFAULT 'production' CHECK (environment IN ('sandbox', 'production')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default Pulse VIP configuration
INSERT INTO gateway_config (name, provider, api_key, api_secret, webhook_url, is_active, environment)
VALUES (
    'Pulse VIP',
    'pulse',
    'e1c98954cc404cbcb2868af9b40c7a33',
    '4XJoHefFKOr593cnD5_xCto1FfzbQYtvfS2Il6aPAY2nyt8Vm-Qi_NoZ8VhyVocfuCloLEfNBb-7sKjGxFH-0A',
    'http://localhost:5000/api/webhook/pulse',
    true,
    'production'
)
ON CONFLICT DO NOTHING;
