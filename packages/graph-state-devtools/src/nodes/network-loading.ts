import { createGraphNode } from 'graph-state';

const networkLoading = createGraphNode<boolean>({
  get: false,
});

export default networkLoading;
