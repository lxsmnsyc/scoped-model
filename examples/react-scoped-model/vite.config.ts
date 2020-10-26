import * as reactPlugin from 'vite-plugin-react';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  jsx: 'react',
  plugins: [reactPlugin],
  optimizeDeps: {
    exclude: [
      'react-scoped-model',
    ],
  },
  hmr : {
    protocol: 'wss'
  },
};

export default config;
