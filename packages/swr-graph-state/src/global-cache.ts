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
import { GraphNodeAsyncResult, GraphNodeAsyncSuccess } from 'graph-state';
import {
  createSWRMap,
  getSWRMapRef,
  SWRMap,
} from './swr-map';
import {
  SWRValue,
  createSWRValue,
  setSWRValue,
} from './swr-value';

const MUTATION = createSWRMap<MutationResult<any>>();
const REVALIDATION = createSWRMap<boolean>();
const TIME = createSWRMap<number>();

export type MutationResult<T> = GraphNodeAsyncResult<T> | undefined;
export type MutationRef<T> = SWRValue<MutationResult<T>>;
export type RevalidationRef = SWRValue<boolean>
export type TimeRef = SWRValue<number>

export function getMutationMap<T>(
  useOwnCache = false,
): SWRMap<MutationResult<T>> {
  if (useOwnCache) {
    return createSWRMap<MutationResult<T>>();
  }
  return MUTATION;
}

export function getRevalidationMap(
  useOwnCache = false,
): SWRMap<boolean> {
  if (useOwnCache) {
    return createSWRMap<boolean>();
  }
  return REVALIDATION;
}

export function getTimeMap(
  useOwnCache = false,
): SWRMap<number> {
  if (useOwnCache) {
    return createSWRMap<number>();
  }
  return TIME;
}

export function createMutationRef<T>(
  key: string,
  value: MutationResult<T>,
  useOwnCache = false,
): MutationRef<T> {
  if (useOwnCache) {
    return createSWRValue<MutationResult<T>>(value);
  }
  return getSWRMapRef(MUTATION, key, value) as MutationRef<T>;
}

export function createRevalidationRef(
  key: string,
  value: boolean,
  useOwnCache = false,
): RevalidationRef {
  if (useOwnCache) {
    return createSWRValue<boolean>(value);
  }
  return getSWRMapRef(REVALIDATION, key, value);
}

export function createTimeRef(
  key: string,
  value: number,
  useOwnCache = false,
): TimeRef {
  if (useOwnCache) {
    return createSWRValue<number>(value);
  }
  return getSWRMapRef(TIME, key, value);
}

export function trigger(
  key: string,
  shouldRevalidate = true,
): void {
  setSWRValue(createTimeRef(key, Date.now()), Date.now(), false);
  setSWRValue(createRevalidationRef(key, shouldRevalidate), shouldRevalidate, true);
}

export function mutate<T>(
  key: string,
  data: T,
  shouldRevalidate = true,
): void {
  trigger(key, shouldRevalidate);
  const result: GraphNodeAsyncSuccess<T> = {
    status: 'success',
    data,
  };
  setSWRValue(createMutationRef<T>(key, result), result, true);
}
