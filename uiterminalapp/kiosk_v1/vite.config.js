// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Путь к родительской директории (на один уровень выше)
  const parentDir = path.resolve(process.cwd(), '../../..')
  
  // Загружаем переменные окружения из родительской директории
  const env = loadEnv(mode, parentDir, '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Настройка для всех API запросов
        '/api': {
          // target: env.VITE_API_URL,
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
  }
})