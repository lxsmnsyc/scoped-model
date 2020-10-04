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
import { GraphNode, GraphNodeKey } from '../graph-node';

export type GraphNodeDependencies = Set<GraphNode<any, any>>;

export interface GraphNodeVersion {
  // Guards dependency registration
  alive: boolean;
  // Dependencies
  dependencies: GraphNodeDependencies;
}

export type GraphNodeListener<T> = (value: T) => void;
export type GraphNodeListeners<T> = Set<GraphNodeListener<T>>;

export interface GraphNodeInstance<T> {
  version: GraphNodeVersion;
  listeners: GraphNodeListeners<T>;
  dependents: GraphNodeDependencies;
}

export interface GraphNodeState<T> {
  value: T;
}

export type GraphNodeInstanceMap = Map<GraphNodeKey, GraphNodeInstance<any>>;
export type GraphNodeStateMap = Map<GraphNodeKey, GraphNodeState<any>>;

export type NodeScheduler = <S, A>(scheduledNode: GraphNode<S, A>) => void;
