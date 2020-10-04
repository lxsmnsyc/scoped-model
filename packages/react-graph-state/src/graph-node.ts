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

// Keys for accessing graph node instances
export type GraphNodeKey = string | number;

// An action for receiving the old state and returning a new state
export type GraphNodeDraftStateAction<S> = (old: S) => S;

// An action which sets the new state
export type GraphNodeDraftState<S> = S | GraphNodeDraftStateAction<S>;

// Function received by the `get` function for yielding state
export type GraphNodeGetYield<S> = (value: S) => void;

export interface GraphNodeGetInterface<S> {
  get: GraphNodeGetValue;
  set: GraphNodeGetYield<S>;
}

export type GraphNodeGetSupplier<S> = (facing: GraphNodeGetInterface<S>) => S;
export type GraphNodeGet<S> = S | GraphNodeGetSupplier<S>;

export interface GraphNodeSetInterface {
  get: GraphNodeGetValue;
  set: GraphNodeSetValue;
}

export type GraphNodeSet<A> = (facing: GraphNodeSetInterface, newValue: A) => void;

export interface GraphNode<S, A> {
  get: GraphNodeGet<S>;
  key: GraphNodeKey;
  set?: GraphNodeSet<A>;
}

export interface GraphNodeBasic<S> extends GraphNode<S, GraphNodeDraftState<S>> {
  set: undefined;
}
export interface GraphNodeEffectful<S, A> extends GraphNode<S, A> {
  set: GraphNodeSet<A>;
}

export interface GraphNodeBasicOptions<S> {
  get: GraphNodeGet<S>;
  key?: GraphNodeKey;
  set?: undefined;
}

export interface GraphNodeEffectfulOptions<S, A> {
  get: GraphNodeGet<S>;
  key?: GraphNodeKey;
  set: GraphNodeSet<A>;
}

export type GraphNodeOptions<S, A> =
  | GraphNodeBasicOptions<S>
  | GraphNodeEffectfulOptions<S, A>;

export type GraphNodeGetValue =
  <S, A>(node: GraphNode<S, A>) => S;
export type GraphNodeSetValue =
  <S, A>(node: GraphNode<S, A>, action: A) => void;

const NODES = new Map<GraphNodeKey, GraphNode<any, any>>();

function createRawGraphNode<S, A>(
  { key, get, set }: GraphNodeOptions<S, A>,
): GraphNode<S, A> {
  return {
    get,
    set,
    key: key ?? generateKey(),
  };
}

export function createGraphNode<S>(
  options: GraphNodeBasicOptions<S>,
): GraphNodeBasic<S>;
export function createGraphNode<S, A>(
  options: GraphNodeEffectfulOptions<S, A>,
): GraphNodeEffectful<S, A>;
export function createGraphNode<S, A>(
  options: GraphNodeOptions<S, A>,
): GraphNode<S, A> {
  if (options.key != null) {
    const currentNode = NODES.get(options.key);
    if (currentNode) {
      return currentNode;
    }
  }
  const node = createRawGraphNode<S, A>(options);
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

export type GraphNodePromise<T> = GraphNodeBasic<Promise<T>>;
export type GraphNodeResource<T> = GraphNodeBasic<GraphNodeAsyncResult<T>>;

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
 * Similar behavior with Promise.race
 * @param resources
 */
export function waitForAny<T>(
  resources: GraphNodeResource<T>[],
): GraphNodeResource<T> {
  const promises = resources.map((resource) => fromResource(resource));

  return createGraphNode({
    get: ({ get, set }) => (
      promiseToResource(
        Promise.race(
          promises.map((promise) => get(promise)),
        ),
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
): GraphNodeBasic<GraphNodeAsyncResult<T>[]> {
  return createGraphNode({
    get: ({ get }) => resources.map((resource) => get(resource)),
    key: `JoinedResource(${joinResourceKeys(resources)})`,
  });
}
