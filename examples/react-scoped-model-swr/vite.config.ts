import * as reactPlugin from 'vite-plugin-react';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  jsx: 'react',
  plugins: [reactPlugin],
  optimizeDeps: {
    exclude: [
      'react-scoped-model',
      'react-scoped-model-swr',
    ],
  },
  hmr: process.env.DEV_REMOTE && {
    protocol: 'wss'
  },
};

export default config;
