export const pulseConfig = {
  baseUrl: process.env.PULSE_BASE_URL || 'https://pulsepayment.app.br',
  clientId: process.env.PULSE_CLIENT_ID,
  apiKey: process.env.PULSE_API_KEY,
  webhookUrl: process.env.PULSE_WEBHOOK_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Id': process.env.PULSE_CLIENT_ID,
    'X-API-Key': process.env.PULSE_API_KEY
  }
};

export default pulseConfig;
