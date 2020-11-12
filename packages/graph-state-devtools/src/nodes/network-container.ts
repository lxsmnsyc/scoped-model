import { createGraphNode } from 'graph-state';

const networkContainer = createGraphNode<HTMLDivElement | null>({
  get: null,
});

export default networkContainer;
