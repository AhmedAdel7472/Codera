/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ApiEnvConfig {
  endpoint: string;
  apiKey: string;
}

function loadApiEnv(): ApiEnvConfig {
  try {
    const envPath = path.resolve('api.env');
    if (fs.existsSync(envPath)) {
      const text = fs.readFileSync(envPath, 'utf-8');
      let endpoint = '';
      let apiKey = '';
      text.split(/\r?\n/).forEach((l: string) => {
        const trimmed = l.trim();
        if (trimmed.startsWith('api-endpoint=')) endpoint = trimmed.replace('api-endpoint=', '').trim();
        if (trimmed.startsWith('api_key=')) apiKey = trimmed.replace('api_key=', '').trim();
      });
      return { endpoint, apiKey };
    }
  } catch (e) { }
  return {
    endpoint: process.env.VITE_AZURE_ENDPOINT || '',
    apiKey: process.env.VITE_AZURE_API_KEY || ''
  };
}

export default defineConfig(({ command }) => {
  const envData = loadApiEnv();

  return {
    base: './',
    plugins: [react()],
    test: {
      include: ['tests/**/*.test.ts'],
      environment: 'node',
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
      },
    },
    define: {
      'import.meta.env.VITE_AZURE_ENDPOINT': JSON.stringify(
        envData.endpoint || 'https://ah30309142502238-8748-resource.services.ai.azure.com/openai/v1/responses'
      ),
      'import.meta.env.VITE_AZURE_API_KEY': JSON.stringify(
        envData.apiKey ? Buffer.from(envData.apiKey).toString('base64') : ''
      )
    },
    server: {
      proxy: {
        '/api/openai-proxy': {
          target: 'https://ah30309142502238-8748-resource.services.ai.azure.com',
          changeOrigin: true,
          secure: false,
          rewrite: (p: string) => p.replace(/^\/api\/openai-proxy/, '/openai/v1/responses')
        }
      }
    }
  };
});
