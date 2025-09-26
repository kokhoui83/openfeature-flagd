import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    server: {
      host: env.VITE_SERVER_HOST || '0.0.0.0',
      port: parseInt(env.VITE_SERVER_PORT || '3000'),
      proxy: {
        '/flagd': {
          target: `http://${env.VITE_FLAGD_HOST || 'localhost'}:${env.VITE_FLAGD_PORT || '8013'}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/flagd/, '')
        }
      }
    },
    define: {
      // Make environment variables available at build time
      'import.meta.env.VITE_FLAGD_HOST': JSON.stringify(env.VITE_FLAGD_HOST),
      'import.meta.env.VITE_FLAGD_PORT': JSON.stringify(env.VITE_FLAGD_PORT),
      'import.meta.env.VITE_FLAGD_TLS': JSON.stringify(env.VITE_FLAGD_TLS)
    }
  }
})
