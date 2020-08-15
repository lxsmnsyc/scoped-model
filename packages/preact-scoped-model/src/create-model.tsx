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
/* @jsx h */
import {
  h,
  createContext,
  Context,
  FunctionComponent,
} from 'preact';
import { useEffect } from 'preact/hooks';
import { AccessibleObject } from './types';
import Notifier from './notifier';
import useConstant from './hooks/useConstant';

export type ModelHook<Model, Props extends AccessibleObject> = (props: Props) => Model;

export interface ModelOptions<Props extends AccessibleObject> {
  displayName?: string;
  defaultProps?: Partial<Props>
}

export interface ScopedModel<Model, Props extends AccessibleObject> {
  context: Context<Notifier<Model> | null>;
  Provider: FunctionComponent<Props>;
}

/**
 * Creates a scoped model instance that generates a state from a given
 * Preact-based hook function which allows fine-grained control on injected
 * contextual state within the component tree.
 * @param useModelHook
 * @param options
 */
export default function createModel<Model, Props extends AccessibleObject>(
  useModelHook: ModelHook<Model, Props>,
  options: ModelOptions<Props> = {},
): ScopedModel<Model, Props> {
  const context = createContext<Notifier<Model> | null>(null);

  /**
   * Display name for the model
   */
  const displayName = options.displayName || 'AnonymousScopedModel';

  const Provider: FunctionComponent<Props> = ({ children, ...props }) => {
    const emitter = useConstant(() => new Notifier<Model>({} as Model));

    const model = useModelHook(props as Props);

    emitter.sync(model);

    useEffect(() => {
      emitter.consume(model);
    }, [emitter, model]);

    return (
      <context.Provider value={emitter}>
        { children }
      </context.Provider>
    );
  };

  /**
   * Provider default props
   */
  Provider.defaultProps = {
    ...options.defaultProps,
    children: undefined,
  };

  /**
   * Display name for the Provider
   */
  Provider.displayName = displayName;

  return {
    context,
    Provider,
  };
}
