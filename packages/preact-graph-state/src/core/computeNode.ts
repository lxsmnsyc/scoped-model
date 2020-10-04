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
import { GraphNode } from '../graph-node';
import createNodeValue from './createNodeValue';
import getNodeInstance from './getNodeInstance';
import registerNodeDependency from './registerNodeDependency';
import setNodeState from './setNodeState';
import { GraphNodeInstanceMap, GraphNodeStateMap, NodeScheduler } from './types';

/**
 * Computes the node value.
 */
export default function computeNode<S, A>(
  nodes: GraphNodeInstanceMap,
  state: GraphNodeStateMap,
  node: GraphNode<S, A>,
  schedule: NodeScheduler,
  actualNode = getNodeInstance(nodes, node),
): S {
  function getDependencyState<R, T>(dependency: GraphNode<R, T>): R {
    const currentState = state.get(dependency.key);

    if (currentState) {
      return currentState.value;
    }

    const newState = {
      value: computeNode(nodes, state, dependency, schedule),
    };

    state.set(dependency.key, newState);

    return newState.value;
  }

  const { version } = actualNode;

  return createNodeValue(
    node,
    (dependency) => {
      const currentState = getDependencyState(dependency);
      if (version.alive) {
        registerNodeDependency(nodes, node, dependency, actualNode);
      }
      return currentState;
    },
    (value) => {
      if (version.alive) {
        setNodeState(state, node, value, schedule);
      }
    },
  );
}
