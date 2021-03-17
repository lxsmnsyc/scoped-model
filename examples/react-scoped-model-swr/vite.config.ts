import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  optimizeDeps: {
    exclude: [
      'react-scoped-model',
      'react-scoped-model-swr',
    ],
  }
});
