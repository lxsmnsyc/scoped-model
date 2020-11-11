import { createGraphNode } from 'graph-state';

const networkError = createGraphNode<Error | null>({
  get: null,
});

export default networkError;
