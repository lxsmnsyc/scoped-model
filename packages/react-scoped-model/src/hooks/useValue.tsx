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
import { useDebugValue } from 'react';
import { ScopedModel, ScopedModelRef } from '../create-model';
import useScopedModelContext from './useScopedModelContext';
import useMemoCondition from './useMemoCondition';
import useSubscription, { Subscription } from './useSubscription';
import { defaultCompare, Compare } from '../utils/comparer';
import { compareTuple } from '../utils/compareTuple';

/**
 * Subscribes to the given model's state
 * @param model the scoped model to read the state from
 * @param shouldUpdate compares the previous state from the next
 * state and re-renders the component and updates the value being
 * consumed if the comparer function returns true.
 */
export default function useValue<S, P>(
  model: ScopedModel<S, P>,
  shouldUpdate: Compare<S> = defaultCompare,
): S {
  const notifier = useScopedModelContext(model);

  const sub = useMemoCondition<Subscription<S>, [ScopedModelRef<S>, Compare<S>]>(
    () => ({
      read: () => {
        if (notifier.subject) {
          return notifier.subject.getCachedValue();
        }

        throw new Error('Unexpected missing model reference.');
      },
      subscribe: (callback) => notifier.subject?.subscribe(callback),
      shouldUpdate,
    }),
    [notifier, shouldUpdate],
    compareTuple,
  );

  /**
   * Return the current state value
   */
  const current = useSubscription(sub);
  useDebugValue(current);
  return current;
}
