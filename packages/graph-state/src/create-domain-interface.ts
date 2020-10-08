import { GraphNode } from './graph-node';
import { GraphDomainMemory, GraphNodeListener } from './create-domain-memory';
import { GraphDomainScheduler } from './create-domain-scheduler';
import getNodeState from './get-node-state';
import registerNodeListener from './register-node-listener';
import unregisterNodeListener from './unregister-node-listener';

export type GraphDomainSetState =
  <S, A>(node: GraphNode<S, A>, action: A) => void;
export type GraphDomainAddListener =
  <S, A>(node: GraphNode<S, A>, listener: GraphNodeListener<S>) => void;
export type GraphDomainRemoveListener =
  <S, A>(node: GraphNode<S, A>, listener: GraphNodeListener<S>) => void;
export type GraphDomainGetState =
  <S, A>(node: GraphNode<S, A>) => S

export interface GraphDomainInterface {
  setState: GraphDomainSetState;
  getState: GraphDomainGetState;
  addListener: GraphDomainAddListener;
  removeListener: GraphDomainRemoveListener;
}

/**
 * Provides interfaces for accessing, modifying and subscribing
 * to node state within a graph domain.
 * @param memory
 * @param scheduler
 */
export default function createGraphDomainInterface(
  memory: GraphDomainMemory,
  scheduler: GraphDomainScheduler,
): GraphDomainInterface {
  return {
    setState: <S, A>(node: GraphNode<S, A>, action: A): void => {
      scheduler.scheduleState({
        action,
        target: node,
      });
    },
    getState: <S, A>(node: GraphNode<S, A>): S => (
      getNodeState(memory, scheduler, node)
    ),
    addListener: <S, A>(node: GraphNode<S, A>, listener: GraphNodeListener<S>): void => {
      registerNodeListener(memory, node, listener);
    },
    removeListener: <S, A>(node: GraphNode<S, A>, listener: GraphNodeListener<S>): void => {
      unregisterNodeListener(memory, node, listener);
    },
  };
}
