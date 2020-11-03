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
  GraphNodeDraftState,
  GraphNodeFactory,
  GraphNodeResourceFactory,
} from 'graph-state';
import {
  SWRGraphNodeBaseOptions,
  SWRGraphNodeFetcher,
} from './create-swr-graph-node';
import { getMutationMap, getRevalidationMap, getTimeMap } from './global-cache';
import {
  getSWRMapRef,
  setSWRMap,
} from './swr-map';
import {
  addSWRValueListener,
  removeSWRValueListener,
} from './swr-value';
import IS_SERVER from './utils/is-server';
import NoServerFetchError from './utils/no-server-fetch-error';

export interface SWRGraphNodeFactoryOptions<T, P extends any[] = []>
  extends SWRGraphNodeBaseOptions<T> {
  fetch: (...args: P) => SWRGraphNodeFetcher<T>;
  key: (...args: P) => string,
}

export interface SWRGraphNodeFactoryInterface<T, P extends any[] = []> {
  mutate: (args: P, value: T, shouldRevalidate?: boolean) => void;
  trigger: (args: P, shouldRevalidate?: boolean) => void;
  resource: GraphNodeResourceFactory<T, P>;
}

type RevalidateNode<P extends any[] = []> =
  GraphNodeFactory<boolean, GraphNodeDraftState<boolean>, P>;

type MutationValue<T> = GraphNodeAsyncResult<T> | undefined;
type MutationNode<T, P extends any[] = []> =
  GraphNodeFactory<MutationValue<T>, GraphNodeDraftState<MutationValue<T>>, P>;

type ResourceValue<T> = GraphNodeAsyncResult<T>;
type ResourceNode<T, P extends any[] = []> =
  GraphNodeFactory<ResourceValue<T>, GraphNodeDraftState<ResourceValue<T>>, P>;

export default function createSWRGraphNodeFactory<T, P extends any[] = []>(
  options: SWRGraphNodeFactoryOptions<T, P>,
): SWRGraphNodeFactoryInterface<T, P> {
  const mutation = getMutationMap<T>(options.useOwnCache);
  const revalidate = getRevalidationMap(options.useOwnCache);
  const time = getTimeMap(options.useOwnCache);

  const revalidateNode: RevalidateNode<P> = createGraphNodeFactory({
    key: (...args) => `SWR.Revalidate[${options.key(...args)}]`,
    get: (...args) => {
      const key = options.key(...args);

      const ref = getSWRMapRef(revalidate, key, false);

      return ({ mutateSelf, subscription }) => {
        subscription(() => {
          addSWRValueListener(ref, mutateSelf);
          return () => {
            removeSWRValueListener(ref, mutateSelf);
          };
        });

        if (!IS_SERVER) {
          const onRevalidate = () => {
            mutateSelf(true);
          };

          // Register polling interval
          if (options.refreshInterval != null) {
            if (options.refreshWhenBlur) {
              subscription(() => {
                let interval: undefined | number;

                const enter = () => {
                  clearInterval(interval);
                  interval = setInterval(onRevalidate, options.refreshInterval);
                };
                const exit = () => {
                  clearInterval(interval);
                  interval = undefined;
                };

                window.addEventListener('blur', enter, false);
                window.addEventListener('focus', exit, false);

                return () => {
                  window.removeEventListener('blur', enter, false);
                  window.removeEventListener('focus', exit, false);
                  clearInterval(interval);
                };
              });
            }
            if (options.refreshWhenOffline) {
              subscription(() => {
                let interval: undefined | number;

                const enter = () => {
                  clearInterval(interval);
                  interval = setInterval(onRevalidate, options.refreshInterval);
                };
                const exit = () => {
                  clearInterval(interval);
                  interval = undefined;
                };

                window.addEventListener('offline', enter, false);
                window.addEventListener('online', exit, false);

                return () => {
                  window.removeEventListener('offline', enter, false);
                  window.removeEventListener('online', exit, false);
                  clearInterval(interval);
                };
              });
            }
            if (options.refreshWhenHidden) {
              subscription(() => {
                let interval: undefined | number;

                const onVisibility = () => {
                  clearInterval(interval);
                  if (document.visibilityState === 'visible') {
                    interval = undefined;
                  } else {
                    interval = setInterval(onRevalidate, options.refreshInterval);
                  }
                };

                window.addEventListener('visibilitychange', onVisibility, false);

                return () => {
                  window.removeEventListener('visibilitychange', onVisibility, false);
                  clearInterval(interval);
                };
              });
            }
            if (
              !(options.refreshWhenHidden
              || options.refreshWhenBlur
              || options.refreshWhenOffline)
            ) {
              subscription(() => {
                const interval = setInterval(onRevalidate, options.refreshInterval);

                return () => {
                  clearInterval(interval);
                };
              });
            }
          }

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

  const mutationNode: MutationNode<T, P> = createGraphNodeFactory({
    key: (...args) => `SWR.Mutation[${options.key(...args)}]`,
    get: (...args) => {
      const key = options.key(...args);

      const ref = getSWRMapRef(mutation, key, options.initialData == null ? undefined : {
        status: 'success',
        data: options.initialData,
      });

      return ({ mutateSelf, subscription }) => {
        subscription(() => {
          addSWRValueListener(ref, mutateSelf);
          return () => {
            removeSWRValueListener(ref, mutateSelf);
          };
        });

        return ref.value;
      };
    },
  });

  const resource: ResourceNode<T, P> = createGraphNodeFactory({
    key: (...args) => `SWR[${options.key(...args)}]`,
    get: (...args) => {
      const key = options.key(...args);
      const mNode = mutationNode(...args);
      const rNode = revalidateNode(...args);
      const fetcher = options.fetch(...args);

      return (methods) => {
        const value = methods.get(mNode);
        const shouldRevalidate = methods.get(rNode);

        const prefetch = () => {
          const currentTime = Date.now();
          setSWRMap(time, key, currentTime, false);
          const newValue = fetcher(methods);

          if (newValue instanceof Promise) {
            newValue.then(
              (data) => {
                const timeRef = time.get(key);

                if (timeRef && timeRef.value === currentTime) {
                  setSWRMap(mutation, key, {
                    status: 'success',
                    data,
                  });
                }
              },
              (data: Error) => {
                const timeRef = time.get(key);

                if (timeRef && timeRef.value === currentTime) {
                  setSWRMap(mutation, key, {
                    status: 'failure',
                    data,
                  });
                }
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
      setSWRMap(time, key, Date.now(), false);
      setSWRMap(revalidate, key, shouldRevalidate);
      setSWRMap(mutation, key, {
        data: value,
        status: 'success',
      });
    },
    trigger: (args, shouldRevalidate = true) => {
      const key = options.key(...args);
      setSWRMap(time, key, Date.now(), false);
      setSWRMap(revalidate, key, shouldRevalidate);
    },
    resource,
  };
}
