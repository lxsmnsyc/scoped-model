import { createGraphNode } from 'graph-state';

export interface NetworkSelected {
  type: 'node' | 'edge';
  id: string;
}

const networkSelected = createGraphNode<NetworkSelected | null>({
  get: null,
});

export default networkSelected;
