import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  azure: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || 'https://ah30309142502238-8748-resource.openai.azure.com/openai/v1',
    model: process.env.OPENAI_MODEL || 'o4-mini',
  }
};
