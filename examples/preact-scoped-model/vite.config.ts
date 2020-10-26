import preactRefresh from '@prefresh/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  jsx: {
    factory: 'h',
    fragment: 'Fragment'
  },
  plugins: [preactRefresh()],
  optimizeDeps: {
    exclude: [
      'preact-scoped-model',
    ],
  },
  hmr: process.env.DEV_REMOTE && {
    protocol: 'wss'
  },
};

export default config;
