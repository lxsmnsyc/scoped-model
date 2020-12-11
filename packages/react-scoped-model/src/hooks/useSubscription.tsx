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
import { useDebugValue, useEffect, useState } from 'react';
import { MemoCompare, defaultCompare } from './useFreshLazyRef';

type ReadSource<T> = () => T;
type Subscribe = (callback: () => void) => (() => void) | undefined | void;

export interface Subscription<T> {
  read: ReadSource<T>;
  subscribe: Subscribe;
  shouldUpdate?: MemoCompare<T>;
}

export default function useSubscription<T>({
  read, subscribe, shouldUpdate = defaultCompare,
}: Subscription<T>): T {
  const [state, setState] = useState(() => ({
    read,
    subscribe,
    shouldUpdate,
    value: read(),
  }));

  let currentValue = state.value;

  if (
    state.read !== read
    || state.subscribe !== subscribe
    || state.shouldUpdate !== shouldUpdate
  ) {
    currentValue = read();

    setState({
      read,
      subscribe,
      shouldUpdate,
      value: currentValue,
    });
  }

  useDebugValue(currentValue);

  useEffect(() => {
    let mounted = true;

    const readCurrent = () => {
      if (mounted) {
        setState((prev) => {
          if (
            prev.read !== read
            || prev.subscribe !== subscribe
            || prev.shouldUpdate !== shouldUpdate
          ) {
            return prev;
          }
          const nextValue = read();
          if (!shouldUpdate(prev.value, nextValue)) {
            return prev;
          }
          return { ...prev, value: nextValue };
        });
      }
    };

    readCurrent();

    const unsubscribe = subscribe(readCurrent);

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [read, subscribe, shouldUpdate]);

  return currentValue;
}
