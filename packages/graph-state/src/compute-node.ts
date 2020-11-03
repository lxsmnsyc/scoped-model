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
import createNodeValue from './create-node-value';
import getNodeInstance from './get-node-instance';
import registerNodeDependency from './register-node-dependency';
import { GraphDomainMemory } from './create-domain-memory';
import { GraphDomainScheduler } from './create-domain-scheduler';
import setNodeState from './set-node-state';

/**
 * Computes the node value
 *
 * If a node has dependencies, this performs recursive computing
 * until all dependencies has been computed.
 * @param nodes A map of internal node instances
 * @param state A map of node state
 * @param node The graph node to compute with
 * @param schedule A function for scheduling dependency notification
 * @param actualNode Actual node instance from the node map
 */
export default function computeNode<S, A>(
  memory: GraphDomainMemory,
  scheduler: GraphDomainScheduler,
  node: GraphNode<S, A>,
  actualNode = getNodeInstance(memory, node),
): S {
  /**
   * This has similar implementations with setNodeState
   * but to prevent circular dependencies, we just
   * rewrite the same code.
   */
  function getDependencyState<R, T>(dependency: GraphNode<R, T>): R {
    const currentState = memory.state.get(dependency.key);

    if (currentState) {
      return currentState.value;
    }

    const newState = {
      value: computeNode(memory, scheduler, dependency),
    };

    memory.state.set(dependency.key, newState);

    return newState.value;
  }

  // Get the current version handle
  const { version } = actualNode;

  return createNodeValue<S, A>(
    node,
    {
      get: (dependency) => {
        // Read dependency state
        const currentState = getDependencyState(dependency);
        // If the version is still alive, register dependency
        if (version.alive) {
          registerNodeDependency(memory, node, dependency, actualNode);
        }
        return currentState;
      },
      mutate: (target, value) => {
        if (version.alive) {
          setNodeState(memory, scheduler, target, value);
        }
      },
      mutateSelf: (value) => {
        if (version.alive) {
          setNodeState(memory, scheduler, node, value);
        }
      },
      setSelf: (action: A) => {
        // If the version is still alive, schedule a state update.
        if (version.alive) {
          scheduler.scheduleState({
            target: node,
            action,
          });
        }
      },
      set: (target, action) => {
        if (version.alive) {
          scheduler.scheduleState({
            target,
            action,
          });
        }
      },
      reset: (target) => {
        if (version.alive) {
          scheduler.scheduleCompute(target);
        }
      },
      subscription: (callback) => {
        if (version.alive) {
          const cleanup = callback();

          if (cleanup) {
            version.cleanups.push(cleanup);
          }
        }
      },
    },
  );
}
