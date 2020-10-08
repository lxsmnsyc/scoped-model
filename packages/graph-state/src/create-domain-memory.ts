import { GraphNode, GraphNodeKey } from './graph-node';

export type GraphNodeDependencies = Set<GraphNode<any, any>>;

export interface GraphNodeVersion {
  // Guards dependency registration
  alive: boolean;
  // Dependencies
  dependencies: GraphNodeDependencies;
}

export type GraphNodeListener<T> = (value: T) => void;
export type GraphNodeListeners<T> = Set<GraphNodeListener<T>>;

export interface GraphNodeInstance<T> {
  version: GraphNodeVersion;
  listeners: GraphNodeListeners<T>;
  dependents: GraphNodeDependencies;
}

export interface GraphNodeState<T> {
  value: T;
}
export type GraphNodeInstanceMap = Map<GraphNodeKey, GraphNodeInstance<any>>;
export type GraphNodeStateMap = Map<GraphNodeKey, GraphNodeState<any>>;

export interface GraphDomainMemory {
  nodes: GraphNodeInstanceMap;
  state: GraphNodeStateMap;
}

export default function createGraphDomainMemory(): GraphDomainMemory {
  return {
    nodes: new Map(),
    state: new Map(),
  };
}
