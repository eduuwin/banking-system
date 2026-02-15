-- Create gateway_logs table
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
