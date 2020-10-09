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
import { GraphDomainInterface, GraphNode } from 'graph-state';
import useFreshState, { RefreshStateDispatch } from './useFreshState';

export type Dependency<S, A> = [GraphDomainInterface, GraphNode<S, A>];

export function compare<S, A>(
  prev: Dependency<S, A>,
  next: Dependency<S, A>,
): boolean {
  return (
    !Object.is(prev[0], next[0]) || !Object.is(prev[1], next[1])
  );
}

export default function useGraphNodeStateBase<S, A>(
  logic: GraphDomainInterface,
  node: GraphNode<S, A>,
): [S, RefreshStateDispatch<S>] {
  return useFreshState<S, Dependency<S, A>>(
    () => logic.getState(node),
    [logic, node],
    compare,
  );
}
