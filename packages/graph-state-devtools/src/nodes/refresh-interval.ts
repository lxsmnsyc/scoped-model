import { createGraphNode } from 'graph-state';

const refreshInterval = createGraphNode({
  get: 5000,
  set: ({ mutateSelf }, value: number) => {
    if (value > 100) {
      mutateSelf(value);
    } else {
      mutateSelf(100);
    }
  },
});

export default refreshInterval;
