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
import { useDebugValue } from 'preact/hooks';
import { ScopedModel } from '../create-model';
import { defaultCompare, Compare } from '../utils/comparer';
import { compareArray } from '../utils/compareTuple';
import useScopedModelContext from './useScopedModelContext';
import useSubscription, { Subscription } from './useSubscription';
import useMemoCondition from './useMemoCondition';

export type SelectorFn<T, R> =
  (model: Readonly<T>) => R;

/**
 * Transforms the model's state and listens for the returned value change.
 *
 * If the value changes, the component re-renders.
 *
 * uses the `Object.is` function for comparison by default.
 *
 * @param model the scoped model to read the state from
 * @param selector a function that receives the model state
 * and transforms it into a new value.
 * @param shouldUpdate a function that compares the
 * previously transformed value to the newly transformed value
 * and if it should replace the previous value and perform an update.
 */
export default function useSelector<S, P, R>(
  model: ScopedModel<S, P>,
  selector: SelectorFn<S, R>,
  shouldUpdate: Compare<R> = defaultCompare,
): R {
  /**
   * Access context
   */
  const notifier = useScopedModelContext(model);

  const sub = useMemoCondition(
    (): Subscription<R> => ({
      read: () => selector(notifier.value),
      subscribe: (callback) => notifier.subscribe(callback),
      shouldUpdate,
    }),
    [notifier, shouldUpdate],
    compareArray,
  );

  /**
   * Return the current state value
   */
  const current = useSubscription(sub);
  useDebugValue(current);
  return current;
}
