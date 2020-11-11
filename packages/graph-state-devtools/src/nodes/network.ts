import { createGraphNode } from 'graph-state';
import { Network } from 'vis-network/standalone/esm';
import edges from './edges';
import nodes from './nodes';
import networkContainer from './network-container';
import networkSelected from './network-selected';

interface ClickEvent {
  edges: string[];
  nodes: string[];
}

const network = createGraphNode<Network | undefined>({
  get: ({ get, subscription, set }) => {
    const container = get(networkContainer);

    if (container) {
      const instance = new Network(container, {
        nodes: get(nodes),
        edges: get(edges),
      }, {});

      subscription(() => {
        instance.on('click', (params: ClickEvent) => {
          if (params.nodes.length) {
            set(networkSelected, {
              type: 'node',
              id: params.nodes[0],
            });
          } else if (params.edges.length) {
            set(networkSelected, {
              type: 'edge',
              id: params.edges[0],
            });
          } else {
            set(networkSelected, null);
          }
        });

        return () => {
          instance.destroy();
        };
      });

      return instance;
    }
    return undefined;
  },
});

export default network;
