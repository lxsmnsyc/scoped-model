import { Network } from 'vis-network/standalone/esm';

export function moveNetworkViewToNode(
  instance: Network,
  id: string,
): void {
  // Move starting position
  instance.moveTo({
    position: instance.getViewPosition(),
  });

  // Animate to target position
  instance.moveTo({
    position: instance.getPosition(id),
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
