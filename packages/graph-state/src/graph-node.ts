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
import generateKey from './generate-key';
// Keys for accessing graph node instances
export type GraphNodeKey = string | number;

// An action for receiving the old state and returning a new state
export type GraphNodeDraftStateAction<S> = (old: S) => S;

// An action which sets the new state
export type GraphNodeDraftState<S> = S | GraphNodeDraftStateAction<S>;

// Function received by the `get` function for yielding state
export type GraphNodeGetYield<S> = (value: S) => void;

export type GraphNodeSubscriptionCleanup = () => void;
export type GraphNodeSubscriptionCallback = () => void | undefined | GraphNodeSubscriptionCleanup;
export type GraphNodeSubscription = (callback: GraphNodeSubscriptionCallback) => void;

export interface GraphNodeCallbackInterface<S> {
  get: GraphNodeGetValue;
  reset: GraphNodeResetValue;
  set: GraphNodeSetValue;
  mutate: GraphNodeGetYield<S>;
}

export interface GraphNodeGetInterface<S> extends GraphNodeCallbackInterface<S> {
  subscription: GraphNodeSubscription;
}

export type GraphNodeGetSupplier<S> = (facing: GraphNodeGetInterface<S>) => S;
export type GraphNodeGet<S> = S | GraphNodeGetSupplier<S>;

export type GraphNodeSetInterface<S> = GraphNodeCallbackInterface<S>;

export type GraphNodeSet<S, A = GraphNodeDraftState<S>> =
  (facing: GraphNodeSetInterface<S>, action: A) => void;

export interface GraphNode<S, A = GraphNodeDraftState<S>> {
  get: GraphNodeGet<S>;
  key: GraphNodeKey;
  set?: GraphNodeSet<S, A>;
}

export interface GraphNodeOptions<S, A = GraphNodeDraftState<S>> {
  get: GraphNodeGet<S>;
  key?: GraphNodeKey;
  set?: GraphNodeSet<S, A>;
}

export type GraphNodeGetValue =
  <S, A = GraphNodeDraftState<S>>(node: GraphNode<S, A>) => S;
export type GraphNodeSetValue =
  <S, A = GraphNodeDraftState<S>>(node: GraphNode<S, A>, action: A) => void;
export type GraphNodeResetValue =
  <S, A = GraphNodeDraftState<S>>(node: GraphNode<S, A>) => void;

const NODES = new Map<GraphNodeKey, GraphNode<any, any>>();

function createRawGraphNode<S, A = GraphNodeDraftState<S>>(
  { key, get, set }: GraphNodeOptions<S, A>,
): GraphNode<S, A> {
  return {
    get,
    set,
    key: key ?? generateKey(),
  };
}

export function createGraphNode<S, A = GraphNodeDraftState<S>>(
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

export type GraphNodePromise<S> = GraphNode<Promise<S>>;
export type GraphNodeResource<S> = GraphNode<GraphNodeAsyncResult<S>>;

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
export function createGraphNodeResource<S, A = GraphNodeDraftState<Promise<S>>>(
  graphNode: GraphNode<Promise<S>, A>,
): GraphNodeResource<S> {
  return createGraphNode({
    get: ({ get, mutate }) => promiseToResource(get(graphNode), mutate),
    key: `Resource(${graphNode.key})`,
  });
}

/**
 * Converts a Resource graph node to a Promise-returning graph node
 * @param resource
 */
export function fromResource<S>(
  resource: GraphNodeResource<S>,
): GraphNodePromise<S> {
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

function joinResourceKeys<S>(
  resources: GraphNodeResource<S>[],
): string {
  return resources.map((resource) => resource.key).join(', ');
}

/**
 * Waits for all Resource graph node to resolve.
 * Similar behavior with Promise.all
 * @param resources
 */
export function waitForAll<S>(
  resources: GraphNodeResource<S>[],
): GraphNodeResource<S[]> {
  const promises = resources.map((resource) => fromResource(resource));

  return createGraphNode({
    get: ({ get, mutate }) => (
      promiseToResource(
        Promise.all(
          promises.map((promise) => get(promise)),
        ),
        mutate,
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
export function waitForAny<S>(
  resources: GraphNodeResource<S>[],
): GraphNodeResource<S> {
  const promises = resources.map((resource) => fromResource(resource));

  return createGraphNode({
    get: ({ get, mutate }) => (
      promiseToResource(
        Promise.race(
          promises.map((promise) => get(promise)),
        ),
        mutate,
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

export type GraphNodeFactoryKey<P extends any[] = []> =
  (...params: P) => string;
export type GraphNodeFactoryGet<S, P extends any[] = []> =
  (...params: P) => GraphNodeGet<S>;
export type GraphNodeFactorySet<S, A = GraphNodeDraftState<S>, P extends any[] = []> =
  (...params: P) => GraphNodeSet<S, A>;

export interface GraphNodeFactoryOptions<S, A = GraphNodeDraftState<S>, P extends any[] = []> {
  baseKey?: GraphNodeKey;
  key?: GraphNodeFactoryKey<P>;
  get: GraphNodeFactoryGet<S, P>;
  set?: GraphNodeFactorySet<S, A, P>;
}

export type GraphNodeFactory<S, A = GraphNodeDraftState<S>, P extends any[] = []> =
  (...params: P) => GraphNode<S, A>;

function defaultKeygen<P extends any[] = []>(...params: P): string {
  return JSON.stringify(params);
}

export function createGraphNodeFactory<S, A = GraphNodeDraftState<S>, P extends any[] = []>(
  {
    key, get, set, baseKey,
  }: GraphNodeFactoryOptions<S, A, P>,
): GraphNodeFactory<S, A, P> {
  const factoryKey = `Factory[${baseKey ?? generateKey()}]`;
  return (...params: P): GraphNode<S, A> => createGraphNode<S, A>({
    key: `${factoryKey}(${key ? key(...params) : defaultKeygen(params)}`,
    get: get(...params),
    set: set ? set(...params) : undefined,
  });
}

export type GraphNodeResourceFactory<S, P extends any[] = []> =
  GraphNodeFactory<
    GraphNodeAsyncResult<S>,
    GraphNodeDraftState<GraphNodeAsyncResult<S>>,
    P
  >;

export function createGraphNodeResourceFactory<
  S,
  A = GraphNodeDraftState<Promise<S>>,
  P extends any[] = [],
>(
  factory: GraphNodeFactory<Promise<S>, A, P>,
): GraphNodeResourceFactory<S, P> {
  return (...params: P): GraphNodeResource<S> => createGraphNodeResource(
    factory(...params),
  );
}
