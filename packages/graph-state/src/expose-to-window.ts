import { GraphDomainMemory, GraphNodeDependencies } from './create-domain-memory';
import { GraphNodeKey } from './graph-node';

export interface GraphNodeDebugData {
  id: GraphNodeKey;
  state?: any;
  dependents: GraphNodeKey[];
  dependencies: GraphNodeKey[];
}

interface WithGraphStateDomainMemory {
  withGraphStateDomainMemory: GraphNodeDebugData[];
}

declare const window: typeof globalThis & WithGraphStateDomainMemory;

function parseDependencies(
  dependencies: GraphNodeDependencies,
): GraphNodeKey[] {
  return Array.from(dependencies).map(
    (node) => node.key,
  );
}

function parseGraphDomainMemory(
  memory: GraphDomainMemory,
): GraphNodeDebugData[] {
  return Array.from(memory.nodes).map(([key, value]) => ({
    id: key,
    state: memory.state.get(key)?.value,
    dependents: parseDependencies(value.dependents),
    dependencies: parseDependencies(value.version.dependencies),
  }));
}

export default function exposeToWindow(
  memory: GraphDomainMemory,
): void {
  if (typeof window !== 'undefined') {
    window.withGraphStateDomainMemory = parseGraphDomainMemory(memory);
  }
}
