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
import createModel, {
  ScopedModel,
  ScopedModelOptions,
} from 'react-scoped-model';
import {
  useSWRInfinite,
  SWRInfiniteConfigInterface,
  SWRInfiniteResponseInterface,
} from 'swr';
import { SWRModelBaseKey } from './create-swr-model';

/**
 * A paginator function that produces a key for
 * a page-based data based on the current index
 * of data and the previously loaded page data.
 */
export type SWRInfiniteModelBaseKey<D> =
  (index: number, previousPageData: D | null) => SWRModelBaseKey;

/**
 * A React-based hook that receives the SWR Model
 * props and produces the SWR key.
 */
export type SWRInfiniteModelKey<D, P > =
  (props: P) => SWRInfiniteModelBaseKey<D>;

/**
 * The fetcher function for the SWR Model.
 *
 * Receives the produced SWR Key.
 */
export type SWRInfiniteModelBaseFetcher<D> =
  (...args: any) => D | Promise<D>;

/**
 * A React-based hook that receives the SWR Model props
 * and returns a fetcher callback.
 */
export type SWRInfiniteModelFetcher<D, P > =
  (props: P) => SWRInfiniteModelBaseFetcher<D>;

/**
 * A React-based hook that receives the SWR Model props
 * and returns an SWR config.
 *
 * Config is merged to the global config.
 */
export type SWRInfiniteModelConfigHook<D, E, P > =
  (props: P) => SWRInfiniteConfigInterface<D, E>;
export type SWRInfiniteModelConfig<D, E, P > =
  SWRInfiniteConfigInterface<D, E> | SWRInfiniteModelConfigHook<D, E, P>;

/**
 * The SWR Model's state.
 */
export type SWRInfiniteModelState<D, E> = SWRInfiniteResponseInterface<D, E>;

/**
 * Alias to the SWR Model's Scoped Model interface.
 */
export type SWRInfiniteModel<D, E, P > =
  ScopedModel<SWRInfiniteModelState<D, E>, P>;

function createConfigHook<D, E, P >(
  config: SWRInfiniteModelConfig<D, E, P>,
): SWRInfiniteModelConfigHook<D, E, P> {
  if (typeof config === 'function') {
    return config;
  }
  return () => config;
}

/**
 * A scoped model based on the SWR Infinite hook.
 * @param key
 * @param fetcher
 * @param config
 * @param options
 */
export default function createSWRInfiniteModel
<D, E, P >(
  key: SWRInfiniteModelKey<D, P>,
  fetcher: SWRInfiniteModelFetcher<D, P>,
  config: SWRInfiniteModelConfig<D, E, P> = {},
  options?: ScopedModelOptions<P>,
): SWRInfiniteModel<D, E, P> {
  const useKey = key;
  const useFetcher = fetcher;
  const useConfig = createConfigHook(config);

  return createModel(
    (props) => {
      const currentKey = useKey(props);
      const currentFetcher = useFetcher(props);
      const currentConfig = useConfig(props);

      return { ...useSWRInfinite(currentKey, currentFetcher, currentConfig) };
    },
    options,
  );
}
