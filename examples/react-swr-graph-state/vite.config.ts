import * as reactPlugin from 'vite-plugin-react';
import type { UserConfig } from 'vite';

const config: UserConfig = {
  jsx: 'react',
  plugins: [reactPlugin],
  optimizeDeps: {
    exclude: [
      'graph-state',
      'react-graph-state',
      'swr-graph-state',
    ],
  },
};

export default config;
