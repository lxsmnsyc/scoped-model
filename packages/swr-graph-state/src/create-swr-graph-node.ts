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
  createGraphNode,
  GraphNodeAsyncPending,
  GraphNodeAsyncResult,
  GraphNodeAsyncSuccess,
  GraphNodeGetInterface,
  GraphNodeResource,
} from 'graph-state';
import {
  createMutationRef,
  createRevalidationRef,
  createTimeRef,
} from './global-cache';
import {
  addSWRValueListener,
  removeSWRValueListener,
  setSWRValue,
} from './swr-value';
import IS_SERVER from './utils/is-server';
import NoServerFetchError from './utils/no-server-fetch-error';

export type SWRGraphNodeRawValue<T> = T | Promise<T>;

export interface SWRGraphNodeBaseOptions<T> {
  revalidateOnFocus?: boolean;
  revalidateOnNetwork?: boolean;
  revalidateOnVisibility?: boolean;
  refreshInterval?: number;
  initialData?: T;
  useOwnCache?: boolean;
  ssr?: boolean;
}

export type SWRGraphNodeFetcher<T> =
  (methods: GraphNodeGetInterface<GraphNodeAsyncResult<T>>) => SWRGraphNodeRawValue<T>;

export interface SWRGraphNodeOptions<T> extends SWRGraphNodeBaseOptions<T> {
  fetch: SWRGraphNodeFetcher<T>;
  key: string;
}

export interface SWRGraphNodeInterface<T> {
  mutate: (value: T, shouldRevalidate?: boolean) => void;
  trigger: (shouldRevalidate?: boolean) => void;
  resource: GraphNodeResource<T>;
}

export default function createSWRGraphNode<T>(
  options: SWRGraphNodeOptions<T>,
): SWRGraphNodeInterface<T> {
  const mutation = createMutationRef<T>(
    options.key,
    // Hydrate cache if initialData is provided.
    options.initialData == null ? undefined : {
      status: 'success',
      data: options.initialData,
    },
    options.useOwnCache,
  );
  const revalidate = createRevalidationRef(options.key, false, options.useOwnCache);
  const time = createTimeRef(options.key, Date.now(), options.useOwnCache);

  // This is a graph node that manages
  // the revalidation state of the resource node.
  const revalidateNode = createGraphNode<boolean>({
    key: options.key != null ? `SWR.Revalidate[${options.key}]` : undefined,
    get: ({ set, subscription }) => {
      // Subscribe to the revalidate cache for external trigger.
      subscription(() => {
        addSWRValueListener(revalidate, set);
        return () => {
          removeSWRValueListener(revalidate, set);
        };
      });

      // Only perform most window events on server-side
      if (!IS_SERVER) {
        const onRevalidate = () => {
          set(true);
        };

        // Register polling interval
        if (options.refreshInterval != null) {
          subscription(() => {
            const interval = setInterval(onRevalidate, options.refreshInterval);

            return () => {
              clearInterval(interval);
            };
          });
        }

        // Registers a focus event for revalidation.
        if (options.revalidateOnFocus) {
          subscription(() => {
            window.addEventListener('focus', onRevalidate, false);

            return () => {
              window.removeEventListener('focus', onRevalidate, false);
            };
          });
        }

        // Registers a online event for revalidation.
        if (options.revalidateOnNetwork) {
          subscription(() => {
            window.addEventListener('online', onRevalidate, false);

            return () => {
              window.removeEventListener('online', onRevalidate, false);
            };
          });
        }

        // Registers a visibility change event for revalidation.
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

      return revalidate.value;
    },
  });

  // This node manages the cache mutation
  const mutationNode = createGraphNode<GraphNodeAsyncResult<T> | undefined>({
    key: options.key != null ? `SWR.Mutation[${options.key}]` : undefined,
    get: ({ set, subscription }) => {
      subscription(() => {
        addSWRValueListener(mutation, set);
        return () => {
          removeSWRValueListener(mutation, set);
        };
      });

      return mutation.value;
    },
  });

  const resource = createGraphNode<GraphNodeAsyncResult<T>>({
    key: options.key != null ? `SWR[${options.key}]` : undefined,
    get: (methods) => {
      // Read the mutation value
      const value = methods.get(mutationNode);
      // Subscribe to revalidation
      const shouldRevalidate = methods.get(revalidateNode);

      const prefetch = () => {
        const currentTime = Date.now();
        time.value = currentTime;
        // Perform fetch
        const newValue = options.fetch(methods);

        // Subscribe to Promise resolution for cache updates
        if (newValue instanceof Promise) {
          newValue.then(
            (data) => {
              if (time.value === currentTime) {
                setSWRValue(mutation, {
                  status: 'success',
                  data,
                });
              }
            },
            (data: Error) => {
              if (time.value === currentTime) {
                setSWRValue(mutation, {
                  status: 'failure',
                  data,
                });
              }
            },
          );
        }

        return newValue;
      };

      // Check if cache is not hydrated
      if (value == null) {
        // Only perform inital data fetch on client-side
        if (!options.ssr && IS_SERVER) {
          throw new NoServerFetchError();
        }

        // Perform initial fetch
        const newValue = prefetch();

        // Set state to pending if new value is a promise.
        if (newValue instanceof Promise) {
          const result: GraphNodeAsyncPending<T> = {
            status: 'pending',
            data: newValue,
          };
          setSWRValue(mutation, result);
          return result;
        }

        // Otherwise, set to success
        const result: GraphNodeAsyncSuccess<T> = {
          status: 'success',
          data: newValue,
        };
        setSWRValue(mutation, result);
        return result;
      }

      // Only revalidate on client-side
      if (shouldRevalidate && (options.ssr || !IS_SERVER)) {
        // Reset revalidation flag
        setSWRValue(revalidate, false);

        const newValue = prefetch();

        // Only set state to pending if previous data is nullish
        if (newValue instanceof Promise) {
          if (value.data == null) {
            const result: GraphNodeAsyncPending<T> = {
              status: 'pending',
              data: newValue,
            };
            setSWRValue(mutation, result);
            return result;
          }
        } else {
          const result: GraphNodeAsyncSuccess<T> = {
            status: 'success',
            data: newValue,
          };
          setSWRValue(mutation, result);
          return result;
        }
      }

      return value;
    },
  });

  return {
    mutate: (value, shouldRevalidate = true) => {
      time.value = Date.now();
      setSWRValue(revalidate, shouldRevalidate);

      setSWRValue(mutation, {
        status: 'success',
        data: value,
      });
    },
    trigger: (shouldRevalidate = true) => {
      time.value = Date.now();
      setSWRValue(revalidate, shouldRevalidate);
    },
    resource,
  };
}
