import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
   proxy: {
      '/api/eimzo': {
        target: 'https://testetirof.cmspace.uz',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/eimzo/, '/eimzo'),
      },
    },
  }
})
