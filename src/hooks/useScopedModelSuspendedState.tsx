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
import { useEffect } from 'react';
import { AccessibleObject } from '../types';
import useScopedModelContext from './useScopedModelContext';
import { ScopedModel } from '../create-model';
import useForceUpdate from './useForceUpdate';
import createCachedData, { suspendCacheData } from '../create-cached-data';
import Notifier from '../notifier';

export interface SuspendSelector<T> {
  value: T;
  suspend: boolean;
}

function captureSuspendedValue<Model, R>(
  notifier: Notifier<Model>,
  next: Model,
  selector: (model: Model) => SuspendSelector<R>,
  key: string,
) {
  return createCachedData(new Promise<R>((resolve) => {
    const { value, suspend } = selector(next);
    if (!suspend) {
      resolve(value);
    } else {
      const listener = (m: Model): void => {
        const { value: innerValue, suspend: innerSuspend } = selector(m);
        if (!innerSuspend) {
          resolve(innerValue);
          notifier.off(listener);
        }
      };

      notifier.on(listener);
    }
  }), key, notifier.cache);
}

/**
 * Listens to the model's properties for changes, and updates
 * the component with a new value.
 *
 * Can only be used inside a Suspense-wrapped component.
 * @param model the scoped model to read the state from
 * @param selector selector function
 * @param key for caching purposes
 */
export default function useScopedModelSuspendedState<Model, Props extends AccessibleObject, R>(
  model: ScopedModel<Model, Props>,
  selector: (model: Model) => SuspendSelector<R>,
  key: string,
): R | undefined {
  const notifier = useScopedModelContext(model);

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const callback = (next: Model): void => {
      captureSuspendedValue(
        notifier,
        next,
        selector,
        key,
      );

      forceUpdate();
    };

    notifier.on(callback);

    return (): void => notifier.off(callback);
  }, [notifier, selector, key, forceUpdate]);

  return suspendCacheData(key, notifier.cache, () => {
    const cachedData = captureSuspendedValue(
      notifier,
      notifier.value,
      selector,
      key,
    );

    throw cachedData.data;
  });
}
