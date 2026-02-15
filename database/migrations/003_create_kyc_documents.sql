-- Create kyc_documents table
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
