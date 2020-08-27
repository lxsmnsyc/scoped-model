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
  AccessibleObject,
  ScopedModelOptions,
} from '@lxsmnsyc/react-scoped-model';
import useSWR, { responseInterface, ConfigInterface } from 'swr';

/**
 * Possible raw values that serves as a key for
 * the SWR.
 *
 * Null keys prevent SWR from fetching.
 */
export type SWRModelBaseKey = string | null | any[];

/**
 * A React-based hook that receives the SWR Model
 * props and produces the SWR key.
 */
export type SWRModelKeyHook<P extends AccessibleObject> =
  (props: P) => SWRModelBaseKey;

/**
 * Key for the SWR Model.
 *
 * A key-returning function
 * will allow dependent or conditional SWR fetching.
 */
export type SWRModelKey<P extends AccessibleObject> =
  SWRModelBaseKey | SWRModelKeyHook<P>;

/**
 * The fetcher function for the SWR Model.
 *
 * Receives the produced SWR Key.
 */
export type SWRModelBaseFetcher<D> =
  (...args: any) => D | Promise<D>;

/**
 * A React-based hook that receives the SWR Model props
 * and returns a fetcher callback.
 */
export type SWRModelFetcher<D, P extends AccessibleObject> =
  (props: P) => SWRModelBaseFetcher<D>;

/**
 * A React-based hook that receives the SWR Model props
 * and returns an SWR config.
 *
 * Config is merged to the global config.
 */
export type SWRModelConfigHook<D, E, P extends AccessibleObject> =
  (props: P) => ConfigInterface<D, E>;
export type SWRModelConfig<D, E, P extends AccessibleObject> =
  ConfigInterface<D, E> | SWRModelConfigHook<D, E, P>;

/**
 * The SWR Model's state.
 */
export type SWRModelState<D, E> = responseInterface<D, E>;

/**
 * Alias to the SWR Model's Scoped Model interface.
 */
export type SWRModel<D, E, P extends AccessibleObject> =
  ScopedModel<SWRModelState<D, E>, P>;

function createKeyHook<P extends AccessibleObject>(
  key: SWRModelKey<P>,
): SWRModelKeyHook<P> {
  if (typeof key === 'function') {
    return key;
  }
  return () => key;
}
function createConfigHook<D, E, P extends AccessibleObject>(
  config: SWRModelConfig<D, E, P>,
): SWRModelConfigHook<D, E, P> {
  if (typeof config === 'function') {
    return config;
  }
  return () => config;
}

/**
 * Creates a scoped model based on the SWR hook.
 *
 * @param key
 * @param fetcher
 * @param config
 * @param options
 */
export default function createSWRModel
<D, E, P extends AccessibleObject>(
  key: SWRModelKey<P>,
  fetcher: SWRModelFetcher<D, P>,
  config: SWRModelConfig<D, E, P> = {},
  options?: ScopedModelOptions<P>,
): SWRModel<D, E, P> {
  const useKey = createKeyHook(key);
  const useFetcher = fetcher;
  const useConfig = createConfigHook(config);

  return createModel(
    (props) => {
      const currentKey = useKey(props);
      const currentFetcher = useFetcher(props);
      const currentConfig = useConfig(props);

      return { ...useSWR(currentKey, currentFetcher, currentConfig) };
    },
    options,
  );
}
