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
      'preact-graph-state'
    ],
  },
};

export default config;
