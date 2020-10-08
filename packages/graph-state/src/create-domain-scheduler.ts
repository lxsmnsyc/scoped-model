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

interface StateUpdate<S, A> {
  action: A;
  target: GraphNode<S, A>;
}

interface StateWork<S, A> {
  type: 'state';
  value: StateUpdate<S, A>;
}

interface ComputeWork<S, A> {
  type: 'compute';
  value: GraphNode<S, A>;
}

interface UpdateWork<S, A> {
  type: 'update';
  value: GraphNode<S, A>;
}

// A unit of work
export type Work<S, A> = StateWork<S, A> | ComputeWork<S, A> | UpdateWork<S, A>;

// Work queue
export type WorkQueue = Work<any, any>[];

export type CompareWork<T> = (a: T, b: T) => boolean;
export type EnqueueWork<T> = (node: T, compare?: CompareWork<T>) => void;

function isUniqueWork(a: Work<any, any>, b: Work<any, any>): boolean {
  return !(a.type === b.type && a.value === b.value);
}

export type ScheduleState = <S, R>(work: StateUpdate<S, R>) => void;
export type ScheduleCompute = <S, R>(work: GraphNode<S, R>) => void;
export type ScheduleUpdate = <S, R>(work: GraphNode<S, R>) => void;

export interface GraphDomainScheduler {
  scheduleState: ScheduleState;
  scheduleCompute: ScheduleCompute;
  scheduleUpdate: ScheduleUpdate;
}

export default function createGraphDomainScheduler(
  enqueue: EnqueueWork<Work<any, any>>,
): GraphDomainScheduler {
  return {
    scheduleState: <S, R>(work: StateUpdate<S, R>): void => {
      enqueue({
        type: 'state',
        value: work,
      });
    },
    scheduleCompute: <S, R>(work: GraphNode<S, R>): void => {
      enqueue({
        type: 'compute',
        value: work,
      }, isUniqueWork);
    },
    scheduleUpdate: <S, R>(work: GraphNode<S, R>): void => {
      enqueue({
        type: 'update',
        value: work,
      }, isUniqueWork);
    },
  };
}
