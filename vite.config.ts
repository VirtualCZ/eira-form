import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const restTarget = env.HR_REST_TARGET ?? env.GAS_REST_TARGET ?? 'http://localhost:8080'

  console.info(`[eira-form] dev proxy: /rest/sm → ${restTarget}/rest/sm/...`)

  return {
    plugins: [react(), tailwindcss()],
    base: "./",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/rest/sm': {
          target: restTarget,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              if (proxyRes.headers['www-authenticate']) {
                delete proxyRes.headers['www-authenticate']
              }
            })
          },
        },
      },
    },
  }
})
