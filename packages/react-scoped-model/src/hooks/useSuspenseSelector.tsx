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
import { ScopedModel } from '../create-model';
import useScopedModelContext from './useScopedModelContext';
import useForceUpdate from './useForceUpdate';
import { suspendCacheData, createCachedData } from '../create-cached-data';
import { AsyncSelectorFn } from './useAsyncSelector';
import useCallbackCondition from './useCallbackCondition';
import useSnapshotBase from './useSnapshotBase';
import { compareArray } from '../utils/compareTuple';

/**
 * Listens to the model's properties for changes, and updates
 * the component with a new async value.
 *
 * Can only be used inside a Suspense-wrapped component.
 * @param model the scoped model to read the state from
 * @param selector selector function
 * @param key for caching purposes
 */
export default function useSuspenseSelector<S, P, R>(
  model: ScopedModel<S, P>,
  selector: AsyncSelectorFn<S, R>,
  key: string,
): R {
  const notifier = useScopedModelContext(model);

  const forceUpdate = useForceUpdate();

  const onSnapshot = useCallbackCondition(
    (next: S) => {
      createCachedData(notifier.model.cache, key, selector(next));

      forceUpdate();
    },
    [notifier, key, selector],
    compareArray,
  );

  useSnapshotBase(notifier, onSnapshot);

  const cache = suspendCacheData(notifier.model.cache, key, () => createCachedData(
    notifier.model.cache,
    key,
    selector(notifier.model.value),
  ));
  useDebugValue(cache);
  return cache;
}
