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
import { AsyncState } from './types';

export function createCachedData<T>(
  promise: Promise<T>,
  key: string,
  cache: Map<string, AsyncState<any>>,
): AsyncState<T> {
  const fullPromise = promise.then(
    (data) => {
      cache.set(key, {
        status: 'success',
        data,
      });
    },
    (data) => {
      cache.set(key, {
        status: 'failure',
        data,
      });
    },
  );

  const cachedData: AsyncState<T> = {
    data: fullPromise,
    status: 'pending',
  };

  cache.set(key, cachedData);

  return cachedData;
}

export function suspendCacheData<T>(
  key: string,
  cache: Map<string, AsyncState<any>>,
  supplier: () => AsyncState<T>,
): T {
  /**
   * Check if cache exists
   */
  if (cache.has(key)) {
    /**
     * Get cache value
     */
    const state = cache.get(key) as AsyncState<T>;

    if (state.status === 'success') {
      return state.data;
    }
    throw state.data;
  }

  throw supplier().data;
}