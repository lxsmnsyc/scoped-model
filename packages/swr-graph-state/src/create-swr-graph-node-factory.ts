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
import {
  createGraphNodeFactory,
  GraphNodeAsyncPending,
  GraphNodeAsyncResult,
  GraphNodeAsyncSuccess,
  GraphNodeResourceFactory,
} from 'graph-state';
import {
  SWRGraphNodeBaseOptions,
  SWRGraphNodeFetcher,
} from './create-swr-graph-node';
import {
  createSWRMap,
  getSWRMapRef,
  setSWRMap,
} from './swr-map';
import {
  addSWRValueListener,
  removeSWRValueListener,
} from './swr-value';
import IS_SERVER from './utils/is-server';
import NoServerFetchError from './utils/no-server-fetch-error';

export interface SWRGraphNodeFactoryOptions<T, P extends unknown[] = []>
  extends SWRGraphNodeBaseOptions<T> {
  fetch: (...args: P) => SWRGraphNodeFetcher<T>;
  key: (...args: P) => string,
}

export interface SWRGraphNodeFactoryInterface<T, P extends unknown[] = []> {
  mutate: (args: P, value: T, shouldRevalidate?: boolean) => void;
  trigger: (args: P, shouldRevalidate?: boolean) => void;
  resource: GraphNodeResourceFactory<P, T>;
}

export default function createSWRGraphNodeFactory<T, P extends unknown[] = []>(
  options: SWRGraphNodeFactoryOptions<T, P>,
): SWRGraphNodeFactoryInterface<T, P> {
  const mutation = createSWRMap<GraphNodeAsyncResult<T> | undefined>();
  const revalidate = createSWRMap<boolean>();

  const revalidateNode = createGraphNodeFactory<P, boolean>({
    key: (...args: P) => `SWR.Revalidate[${options.key(...args)}]`,
    get: (...args: P) => {
      const key = options.key(...args);

      const ref = getSWRMapRef(revalidate, key, true);

      return ({ set, subscription }) => {
        subscription(() => {
          addSWRValueListener(ref, set);
          return () => {
            removeSWRValueListener(ref, set);
          };
        });

        if (!IS_SERVER) {
          const onRevalidate = () => {
            set(true);
          };

          if (options.revalidateOnFocus) {
            subscription(() => {
              window.addEventListener('focus', onRevalidate, false);

              return () => {
                window.removeEventListener('focus', onRevalidate, false);
              };
            });
          }
          if (options.revalidateOnNetwork) {
            subscription(() => {
              window.addEventListener('online', onRevalidate, false);

              return () => {
                window.removeEventListener('online', onRevalidate, false);
              };
            });
          }
          if (options.revalidateOnVisibility) {
            subscription(() => {
              const onVisible = () => {
                if (document.visibilityState === 'visible') {
                  onRevalidate();
                }
              };

              window.addEventListener('visibilitychange', onVisible, false);

              return () => {
                window.removeEventListener('visibilitychange', onVisible, false);
              };
            });
          }
        }

        return ref.value;
      };
    },
  });

  const mutationNode = createGraphNodeFactory<P, GraphNodeAsyncResult<T> | undefined>({
    key: (...args: P) => `SWR.Mutation[${options.key(...args)}]`,
    get: (...args: P) => {
      const key = options.key(...args);

      const ref = getSWRMapRef(mutation, key, undefined);

      if (options.initialData != null) {
        setSWRMap(mutation, key, {
          status: 'success',
          data: options.initialData,
        });
      }

      return ({ set, subscription }) => {
        subscription(() => {
          addSWRValueListener(ref, set);
          return () => {
            removeSWRValueListener(ref, set);
          };
        });

        return ref.value;
      };
    },
  });

  const resource = createGraphNodeFactory<P, GraphNodeAsyncResult<T>>({
    key: (...args: P) => `SWR[${options.key(...args)}]`,
    get: (...args: P) => {
      const key = options.key(...args);
      const mNode = mutationNode(...args);
      const rNode = revalidateNode(...args);
      const fetcher = options.fetch(...args);

      return (methods) => {
        const value = methods.get(mNode);
        const shouldRevalidate = methods.get(rNode);

        const prefetch = () => {
          const newValue = fetcher(methods);

          if (newValue instanceof Promise) {
            newValue.then(
              (data) => {
                setSWRMap(mutation, key, {
                  status: 'success',
                  data,
                });
              },
              (data: Error) => {
                setSWRMap(mutation, key, {
                  status: 'failure',
                  data,
                });
              },
            );
          }

          return newValue;
        };

        if (value == null) {
          if (!options.ssr && IS_SERVER) {
            throw new NoServerFetchError();
          }
          const newValue = prefetch();

          if (newValue instanceof Promise) {
            const result: GraphNodeAsyncPending<T> = {
              status: 'pending',
              data: newValue,
            };
            setSWRMap(mutation, key, result);
            return result;
          }

          const result: GraphNodeAsyncSuccess<T> = {
            status: 'success',
            data: newValue,
          };
          setSWRMap(mutation, key, result);
          return result;
        }

        if (shouldRevalidate && (options.ssr || !IS_SERVER)) {
          setSWRMap(revalidate, key, false);

          const newValue = prefetch();

          if (newValue instanceof Promise) {
            if (value.data == null) {
              const result: GraphNodeAsyncPending<T> = {
                status: 'pending',
                data: newValue,
              };
              setSWRMap(mutation, key, result);
              return result;
            }
          } else {
            const result: GraphNodeAsyncSuccess<T> = {
              status: 'success',
              data: newValue,
            };
            setSWRMap(mutation, key, result);
            return result;
          }
        }

        return value;
      };
    },
  });

  return {
    mutate: (args, value, shouldRevalidate = true) => {
      const key = options.key(...args);
      setSWRMap(revalidate, key, shouldRevalidate);
      setSWRMap(mutation, key, {
        data: value,
        status: 'success',
      });
    },
    trigger: (args, shouldRevalidate = true) => {
      const key = options.key(...args);
      setSWRMap(revalidate, key, shouldRevalidate);
    },
    resource,
  };
}
