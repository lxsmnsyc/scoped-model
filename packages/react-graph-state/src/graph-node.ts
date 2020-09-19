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

export type GraphNodeDraftStateAction<T> = (old: T) => T;
export type GraphNodeDraftState<T> = T | GraphNodeDraftStateAction<T>;

export type GraphNodeGetYield<T> = (value: T) => void;
export type GraphNodeGetSupplier<T> = (get: GraphNodeGetValue, set: GraphNodeGetYield<T>) => T;
export type GraphNodeGet<T> = T | GraphNodeGetSupplier<T>;
export type GraphNodeKey = string | number;
export type GraphNodeSet<T> = (get: GraphNodeGetValue, set: GraphNodeSetValue, newValue: T) => void;

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

export function createGraphNode<T>({ get, set, key }: GraphNodeOptions<T>): GraphNode<T> {
  return {
    get,
    set: set ?? EMPTY_SET,
    key: key ?? generateKey(),
  };
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

export type GraphNodeResource<T> = GraphNode<GraphNodeAsyncResult<T>>;

export function createGraphNodeResource<T>(
  graphNode: GraphNode<Promise<T>>,
): GraphNodeResource<T> {
  return createGraphNode({
    get: (get, set) => {
      const promise = get(graphNode);

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
    },
    key: `Resource(${graphNode.key})`,
  });
}
