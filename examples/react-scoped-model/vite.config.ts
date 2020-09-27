import * as reactPlugin from 'vite-plugin-react';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  jsx: 'react',
  plugins: [reactPlugin],
  optimizeDeps: {
    exclude: [
      '@lxsmnsyc/react-scoped-model',
    ],
  },
};

export default config;
