-- Create gateway_config table
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
