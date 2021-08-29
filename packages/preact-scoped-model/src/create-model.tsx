/**
 * @license
 * MIT License
 *
 * Copyright (c) 2021 Alexis Munsayac
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
 * @copyright Alexis Munsayac 2021
 */
/** @jsx h */
import {
  h,
  createContext,
  Context,
  FunctionComponent,
} from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { memo } from 'preact/compat';
import {
  useConstant,
} from '@lyonph/preact-hooks';
import Notifier from './notifier';
import generateId from './utils/id';
import MissingScopedModelError from './utils/MissingScopedModelError';

export type ScopedModelHook<Model, Props = unknown> = (props: Props) => Model;

export type ScopedModelMemo<Props = unknown> = (prev: Props, next: Props) => boolean;
export type ScopedModelBailout<T> = (prev: T, next: T) => boolean;

export interface ScopedModelOptions<Model, Props = unknown> {
  displayName?: string;
  defaultProps?: Partial<Props>;
  shouldUpdate?: ScopedModelMemo<Props>;
  shouldNotify?: ScopedModelBailout<Model>;
}

export interface ScopedModel<Model, Props = unknown> {
  context: Context<Notifier<Model> | null>;
  Provider: FunctionComponent<Props>;
  displayName: string;
}

function SHOULD_NOTIFY<T>(a: T, b: T): boolean {
  return !Object.is(a, b);
}

/**
 * Creates a scoped model instance that generates a state from a given
 * Preact-based hook function which allows fine-grained control on injected
 * contextual state within the component tree.
 * @param useModelHook
 * @param options
 */
export default function createModel<Model, Props>(
  useModelHook: ScopedModelHook<Model, Props>,
  options: ScopedModelOptions<Model, Props> = {},
): ScopedModel<Model, Props> {
  const context = createContext<Notifier<Model> | null>(null);
  const id = generateId();
  /**
   * Display name for the model
   */
  const displayName = options.displayName || `ScopedModel-${id}`;
  const shouldNotify = options.shouldNotify ?? SHOULD_NOTIFY;

  const ProcessorInner: FunctionComponent<Props> = (props) => {
    const emitter = useContext(context);
    if (!emitter) {
      throw new MissingScopedModelError(displayName);
    }

    const model = useModelHook(props as Props);

    emitter.hydrate(model);

    useEffect(() => {
      emitter.initialized = true;
    }, [emitter]);

    useEffect(() => {
      const hasValue = emitter.hasValue();
      if ((hasValue && shouldNotify(emitter.value, model)) || !hasValue) {
        emitter.consume(model);
      }
    }, [emitter, model]);

    return null;
  };

  const Processor = memo(ProcessorInner, options.shouldUpdate);

  const Provider: FunctionComponent<Props> = ({ children, ...props }) => {
    const emitter = useConstant(() => new Notifier<Model>());

    useEffect(() => () => {
      emitter.destroy();
    }, [emitter]);

    return (
      <context.Provider value={emitter}>
        <Processor {...props as Props} />
        { children }
      </context.Provider>
    );
  };

  /**
   * Provider default props
   */
  Provider.defaultProps = options.defaultProps;

  /**
   * Display name for the Provider
   */
  if (process.env.NODE_ENV !== 'production') {
    ProcessorInner.displayName = `ScopedModelProcessor(${displayName}.Processor)`;
    Processor.displayName = `ScopedModelProcessor(${displayName}.Processor)`;
    Provider.displayName = `ScopedModel(${displayName})`;
    context.Provider.displayName = `${displayName}.Provider`;
  }

  return {
    context,
    Provider,
    displayName,
  };
}
