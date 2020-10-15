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
  createGraphNodeResource,
  GraphNode,
  GraphNodeGetInterface,
  GraphNodeResource,
} from 'graph-state';
import {
  addSWRValueListener,
  createSWRValue,
  removeSWRValueListener,
  setSWRValue,
} from './swr-value';
import IS_SERVER from './utils/is-server';

export type SWRGraphNodeRawValue<T> = T | Promise<T>;

export interface SWRGraphNodeBaseOptions<T> {
  revalidateOnFocus?: boolean;
  revalidateOnNetwork?: boolean;
  revalidateOnVisibility?: boolean;
  initialData: T;
  ssr?: boolean;
}

export interface SWRGraphNodeOptions<T> extends SWRGraphNodeBaseOptions<T> {
  fetch: (methods: GraphNodeGetInterface<T>) => SWRGraphNodeRawValue<T>;
  key?: string;
}

export interface SWRGraphNodeInterface<T> {
  mutate: (value: SWRGraphNodeRawValue<T>, shouldRevalidate?: boolean) => void;
  trigger: (shouldRevalidate?: boolean) => void;
  node: GraphNode<SWRGraphNodeRawValue<T>>;
  resource: GraphNodeResource<T>;
}

export default function createSWRGraphNode<T>(
  options: SWRGraphNodeOptions<T>,
): SWRGraphNodeInterface<T> {
  const mutation = createSWRValue<SWRGraphNodeRawValue<T>>(options.initialData);
  const revalidate = createSWRValue(true);

  const revalidateNode = createGraphNode<boolean>({
    key: options.key != null ? `SWR.Revalidate[${options.key}]` : undefined,
    get: ({ set, subscription }) => {
      subscription(() => {
        addSWRValueListener(revalidate, set);
        return () => {
          removeSWRValueListener(revalidate, set);
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

      return revalidate.value;
    },
  });

  const mutationNode = createGraphNode<SWRGraphNodeRawValue<T>>({
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

  const node = createGraphNode<SWRGraphNodeRawValue<T>>({
    key: options.key != null ? `SWR[${options.key}]` : undefined,
    get: (methods) => {
      const value = methods.get(mutationNode);
      const shouldRevalidate = methods.get(revalidateNode);

      if (shouldRevalidate && (options.ssr || !IS_SERVER)) {
        setSWRValue(revalidate, false);

        const newValue = options.fetch(methods);

        if (newValue instanceof Promise) {
          newValue.then((result) => {
            setSWRValue(mutation, result);
          }, () => {
            ///
          });

          if (value == null) {
            setSWRValue(mutation, newValue);
          }
        } else {
          setSWRValue(mutation, newValue);
        }
      }

      return value;
    },
  });

  const resource = createGraphNodeResource(node);

  return {
    mutate: (value, shouldRevalidate = true) => {
      setSWRValue(revalidate, shouldRevalidate);
      setSWRValue(mutation, value);
    },
    trigger: (shouldRevalidate = true) => {
      setSWRValue(revalidate, shouldRevalidate);
    },
    node,
    resource,
  };
}
