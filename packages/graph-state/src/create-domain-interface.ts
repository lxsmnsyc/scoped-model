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
