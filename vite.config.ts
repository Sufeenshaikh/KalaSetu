// sufeenshaikh/kalasetu/KalaSetu-d99804801d69f74fc1930d1e0bbc7c9d67cf34e9/vite.config.ts

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // FIX 1: Explicitly set base path for Vercel deployment
      base: '/', 
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // FIX 2: Add fallback (|| null) for environment variables 
        // to prevent hardcoding the literal string "undefined" if the key is missing on Vercel.
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || null),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || null)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
