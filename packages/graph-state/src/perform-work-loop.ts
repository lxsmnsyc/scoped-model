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
import computeNode from './compute-node';
import { GraphDomainInterface } from './create-domain-interface';
import { GraphDomainMemory } from './create-domain-memory';
import { GraphDomainScheduler, Work, WorkQueue } from './create-domain-scheduler';
import deprecateNodeBaseVersion from './deprecate-node-base-version';
import deprecateNodeVersion from './deprecate-node-version';
import exposeToWindow from './expose-to-window';
import getDraftState from './get-draft-state';
import getNodeInstance from './get-node-instance';
import getNodeState from './get-node-state';
import setNodeState from './set-node-state';

export default function performWorkLoop(
  memory: GraphDomainMemory,
  scheduler: GraphDomainScheduler,
  methods: GraphDomainInterface,
  workQueue: WorkQueue,
  resetWork: () => void,
): void {
  if (workQueue.length > 0) {
    resetWork();
    workQueue.forEach((work: Work<any, any>) => {
      switch (work.type) {
        case 'state': {
          const { action, target } = work.value;
          // Get instance node
          const currentState = getNodeState(memory, scheduler, target);

          if (target.set) {
            // Deprecate setter version
            deprecateNodeBaseVersion(memory, target);

            const { setterVersion } = getNodeInstance(memory, target);
            // Run the node setter for further effects
            target.set({
              get: methods.getState,
              set: (node, newAction) => {
                if (setterVersion.alive) {
                  methods.setState(node, newAction);
                }
              },
              setSelf: (newAction) => {
                if (setterVersion.alive) {
                  methods.setState(target, newAction);
                }
              },
              mutate: (node, newValue) => {
                if (setterVersion.alive) {
                  setNodeState(memory, scheduler, node, newValue);
                }
              },
              mutateSelf: (newValue) => {
                if (setterVersion.alive) {
                  setNodeState(memory, scheduler, target, newValue);
                }
              },
              reset: (node) => {
                if (setterVersion.alive) {
                  methods.resetState(node);
                }
              },
            }, action);
          } else {
            // Notify for new node value
            setNodeState(
              memory,
              scheduler,
              target,
              getDraftState(action, currentState),
            );
          }
        }
          break;
        case 'compute': {
          const node = work.value;
          // Access internal node or create a new one.
          const actualNode = getNodeInstance(memory, node);
          /**
           * Clean the previous version to prevent
           * asynchronous dependency registration.
           */
          deprecateNodeVersion(memory, node);
          /**
           * Set the new node value by recomputing the node.
           * This may recursively compute.
           */
          setNodeState(
            memory,
            scheduler,
            node,
            computeNode(memory, scheduler, node, actualNode),
          );
        }
          break;
        case 'update': {
          const node = work.value;
          const currentNode = getNodeInstance(memory, node);
          const nodeValue = methods.getState(node);
          currentNode.dependents.forEach((dependent) => {
            scheduler.scheduleCompute(dependent);
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

    if (process.env.NODE_ENV !== 'production') {
      exposeToWindow(memory);
    }
  }
}
