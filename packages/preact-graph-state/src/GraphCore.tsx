/**
 * @license
 * MIT License
 *
 * Copyright (c) 2020 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2020
 */
/** @jsx h */
import { h, Fragment, VNode } from 'preact';
import { memo } from 'preact/compat';
import getDraftState from './core/getDraftState';
import computeNode from './core/computeNode';
import deprecateNodeVersion from './core/deprecateNodeVersion';
import getNodeInstance from './core/getNodeInstance';
import getNodeState from './core/getNodeState';
import registerNodeListener from './core/registerNodeListener';
import setNodeState from './core/setNodeState';
import unregisterNodeListener from './core/unregisterNodeListener';
import { GraphNodeInstanceMap, GraphNodeListener, GraphNodeStateMap } from './core/types';
import { GraphNode, GraphNodeDraftState } from './graph-node';
import useConstant from './hooks/useConstant';
import useConstantCallback from './hooks/useConstantCallback';
import useIsomorphicEffect from './hooks/useIsomorphicEffect';
import useWorkQueue from './hooks/useWorkQueue';
import { useGraphDomainContext } from './GraphDomainContext';

interface StateUpdate<T> {
  action: GraphNodeDraftState<T>;
  target: GraphNode<T>;
}

interface StateWork<T> {
  type: 'state';
  value: StateUpdate<T>;
}

interface ComputeWork<T> {
  type: 'compute';
  value: GraphNode<T>;
}

interface UpdateWork<T> {
  type: 'update';
  value: GraphNode<T>;
}

type Work<T> = StateWork<T> | ComputeWork<T> | UpdateWork<T>;

function isUniqueWork(a: Work<any>, b: Work<any>): boolean {
  return !(a.type === b.type && a.value === b.value);
}

function GraphCoreProcess(): VNode {
  const { current } = useGraphDomainContext();
  const nodes = useConstant<GraphNodeInstanceMap>(() => new Map());
  const state = useConstant<GraphNodeStateMap>(() => new Map());

  const [workQueue, scheduleWork, resetWork] = useWorkQueue<Work<any>>();

  const scheduleState = useConstantCallback(
    <R, >(work: StateUpdate<R>): void => {
      scheduleWork({
        type: 'state',
        value: work,
      });
    },
  );
  const scheduleCompute = useConstantCallback(
    <R, >(work: GraphNode<R>): void => {
      scheduleWork({
        type: 'compute',
        value: work,
      }, isUniqueWork);
    },
  );
  const scheduleUpdate = useConstantCallback(
    <R, >(work: GraphNode<R>): void => {
      scheduleWork({
        type: 'update',
        value: work,
      }, isUniqueWork);
    },
  );

  const updateState = useConstantCallback(
    <R, >(dependency: GraphNode<R>, newAction: GraphNodeDraftState<R>): void => {
      scheduleState({
        action: newAction,
        target: dependency,
      });
    },
  );

  const addListener = useConstantCallback(
    <R, >(node: GraphNode<R>, listener: GraphNodeListener<R>): void => {
      registerNodeListener(nodes, node, listener);
    },
  );

  const removeListener = useConstantCallback(
    <R, >(node: GraphNode<R>, listener: GraphNodeListener<R>): void => {
      unregisterNodeListener(nodes, node, listener);
    },
  );

  const getState = useConstantCallback(
    <R, >(node: GraphNode<R>): R => (
      getNodeState(nodes, state, node, scheduleUpdate)
    ),
  );

  current.value = {
    updateState,
    addListener,
    removeListener,
    getState,
  };

  useIsomorphicEffect(() => {
    if (workQueue.length > 0) {
      resetWork();
      workQueue.forEach((work: Work<any>) => {
        switch (work.type) {
          case 'state': {
            const { action, target } = work.value;
            // Get instance node
            const currentState = getNodeState(nodes, state, target, scheduleUpdate);
            // Extract draft state similar to useState
            const draftState = getDraftState(action, currentState);
            /**
             * Clean the previous version to prevent
             * asynchronous dependency registration.
             */
            deprecateNodeVersion(nodes, target);

            // Run the node setter for further effects
            target.set(
              {
                // Getter doesn't need dependency building.
                get: <R, >(dependency: GraphNode<R>): R => (
                  getNodeState(nodes, state, dependency, scheduleUpdate)
                ),
                // Setter
                set: <R, >(dependency: GraphNode<R>, newAction: GraphNodeDraftState<R>): void => {
                  // Schedule a node update
                  updateState(dependency, newAction);
                },
              },
              // Send the draft state
              draftState,
            );

            // Notify for new node value
            setNodeState(
              state,
              target,
              draftState,
              scheduleUpdate,
            );
          }
            break;
          case 'compute': {
            const node = work.value;
            // Access internal node or create a new one.
            const actualNode = getNodeInstance(nodes, node);
            /**
             * Clean the previous version to prevent
             * asynchronous dependency registration.
             */
            deprecateNodeVersion(nodes, node);
            /**
             * Set the new node value by recomputing the node.
             * This may recursively compute.
             */
            setNodeState(
              state,
              node,
              computeNode(nodes, state, node, scheduleUpdate, actualNode),
              scheduleUpdate,
            );
          }
            break;
          case 'update': {
            const node = work.value;
            const currentNode = getNodeInstance(nodes, node);
            const nodeValue = getNodeState(nodes, state, node, scheduleUpdate);
            currentNode.dependents.forEach((dependent) => {
              scheduleCompute(dependent);
            });
            currentNode.listeners.forEach((subscriber) => {
              subscriber(nodeValue);
            });
          }
            break;
          default:
            break;
        }
      });
    }
  }, [workQueue]);

  return <Fragment />;
}

const GraphCore = memo(GraphCoreProcess, () => true);

export default GraphCore;
