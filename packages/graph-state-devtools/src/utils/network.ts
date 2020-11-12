import { Network } from 'vis-network/standalone/esm';

export function moveNetworkViewToNode(
  instance: Network,
  id: string,
): void {
  instance.fit({
    nodes: [id],
    animation: true,
  });
}

export function selectNode(
  instance: Network,
  id: string,
): void {
  if (instance.getSelectedNodes().indexOf(id) === -1) {
    instance.selectNodes([id], true);
  }
}
