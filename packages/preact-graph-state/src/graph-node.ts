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
import generateKey from './utils/generate-key';

export type GraphNodeKey = string | number;

export type GraphNodeDraftStateAction<T> = (old: T) => T;
export type GraphNodeDraftState<T> = T | GraphNodeDraftStateAction<T>;

export type GraphNodeGetYield<T> = (value: T) => void;

export interface GraphNodeGetInterface<T> {
  get: GraphNodeGetValue;
  set: GraphNodeGetYield<T>;
}

export type GraphNodeGetSupplier<T> = (facing: GraphNodeGetInterface<T>) => T;
export type GraphNodeGet<T> = T | GraphNodeGetSupplier<T>;

export interface GraphNodeSetInterface {
  get: GraphNodeGetValue;
  set: GraphNodeSetValue;
}

export type GraphNodeSet<T> = (facing: GraphNodeSetInterface, newValue: T) => void;

export interface GraphNode<T> {
  get: GraphNodeGet<T>;
  set: GraphNodeSet<T>;
  key: GraphNodeKey;
}

export interface GraphNodeOptions<T> {
  get: GraphNodeGet<T>;
  set?: GraphNodeSet<T>;
  key?: GraphNodeKey;
}

export type GraphNodeValueType<T> = T extends GraphNode<infer U> ? U : never;

export type GraphNodeGetValue = <T>(node: GraphNode<T>) => T;
export type GraphNodeSetValue = <T>(node: GraphNode<T>, newValue: GraphNodeDraftState<T>) => void;

const EMPTY_SET = () => {
  // Empty
};

const NODES = new Map<string | number, GraphNode<any>>();

function createRawGraphNode<T>({ get, set, key }: GraphNodeOptions<T>): GraphNode<T> {
  return {
    get,
    set: set ?? EMPTY_SET,
    key: key ?? generateKey(),
  };
}

export function createGraphNode<T>(options: GraphNodeOptions<T>): GraphNode<T> {
  if (options.key != null) {
    const currentNode = NODES.get(options.key);
    if (currentNode) {
      return currentNode;
    }
  }
  const node = createRawGraphNode(options);
  NODES.set(node.key, node);
  return node;
}

export interface GraphNodeAsyncPending<T> {
  data: Promise<T>;
  status: 'pending';
}
export interface GraphNodeAsyncSuccess<T> {
  data: T;
  status: 'success';
}
export interface GraphNodeAsyncFailure {
  data: any;
  status: 'failure';
}
export type GraphNodeAsyncResult<T> =
  | GraphNodeAsyncPending<T>
  | GraphNodeAsyncSuccess<T>
  | GraphNodeAsyncFailure;

export type GraphNodePromise<T> = GraphNode<Promise<T>>;
export type GraphNodeResource<T> = GraphNode<GraphNodeAsyncResult<T>>;

function promiseToResource<T>(
  promise: Promise<T>,
  set: GraphNodeGetYield<GraphNodeAsyncResult<T>>,
): GraphNodeAsyncResult<T> {
  promise.then(
    (data) => set({
      data,
      status: 'success',
    }),
    (data) => set({
      data,
      status: 'failure',
    }),
  );

  return {
    data: promise,
    status: 'pending',
  };
}

/**
 * Converts a Promise-returning graph node into a Resource graph node
 * @param graphNode
 */
export function createGraphNodeResource<T>(
  graphNode: GraphNodePromise<T>,
): GraphNodeResource<T> {
  return createGraphNode({
    get: ({ get, set }) => promiseToResource(get(graphNode), set),
    key: `Resource(${graphNode.key})`,
  });
}

/**
 * Converts a Resource graph node to a Promise-returning graph node
 * @param resource
 */
export function fromResource<T>(
  resource: GraphNodeResource<T>,
): GraphNodePromise<T> {
  return createGraphNode({
    get: async ({ get }) => {
      const result = get(resource);

      if (result.status === 'failure') {
        throw result.data;
      }
      return result.data;
    },
    key: `Promise(${resource.key})`,
  });
}

function joinResourceKeys<T>(
  resources: GraphNodeResource<T>[],
): string {
  return resources.map((resource) => resource.key).join(', ');
}

/**
 * Waits for all Resource graph node to resolve.
 * Similar behavior with Promise.all
 * @param resources
 */
export function waitForAll<T>(
  resources: GraphNodeResource<T>[],
): GraphNodeResource<T[]> {
  const promises = resources.map((resource) => fromResource(resource));

  return createGraphNode({
    get: ({ get, set }) => (
      promiseToResource(
        Promise.all(
          promises.map((promise) => get(promise)),
        ),
        set,
      )
    ),
    key: `WaitForAll(${joinResourceKeys(resources)})`,
  });
}

/**
 * Waits for any Resource graph node to resolve.
 * Similar behavior with Promise.any
 * @param resources
 */
export function waitForAny<T>(
  resources: GraphNodeResource<T>[],
): GraphNodeResource<T> {
  const promises = resources.map((resource) => fromResource(resource));

  return createGraphNode({
    get: ({ get, set }) => (
      promiseToResource(
        new Promise((resolve, reject) => {
          promises.forEach((promise) => {
            get(promise).then(resolve, reject);
          });
        }),
        set,
      )
    ),
    key: `WaitForAny(${joinResourceKeys(resources)})`,
  });
}

/**
 * Joins Resource graph nodes into a graph node that returns
 * an array of resources
 * @param resources
 */
export function joinResources<T>(
  resources: GraphNodeResource<T>[],
): GraphNode<GraphNodeAsyncResult<T>[]> {
  return createGraphNode({
    get: ({ get }) => resources.map((resource) => get(resource)),
    key: `JoinedResource(${joinResourceKeys(resources)})`,
  });
}
