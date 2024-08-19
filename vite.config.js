import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['express', 'vite-express', 'multer', './server/gemini.js'],
  },
  build: {
    rollupOptions: {
      input: './server/index.js',
    },
  },
})
