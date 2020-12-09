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
import React, {
  createContext,
  Context,
  WeakValidationMap,
  useContext,
  FC,
  memo,
  useDebugValue,
} from 'react';
import {
  createExternalSubject,
  ExternalSubject,
} from 'react-external-subject';
import Notifier from './notifier';
import useConstant from './hooks/useConstant';
import MissingScopedModelError from './utils/MissingScopedModelError';
import generateId from './utils/id';
import useIsomorphicEffect from './hooks/useIsomorphicEffect';

export type ScopedModelHook<Model, Props = unknown> = (props: Props) => Model;

export type ScopedModelMemo<Props = unknown> = (prev: Props, next: Props) => boolean;

export interface ScopedModelRef<Model> {
  model: Notifier<Model>;
  subject?: ExternalSubject<Model>;
}

export interface ScopedModelOptions<Props = unknown> {
  displayName?: string;
  propTypes?: WeakValidationMap<Props>;
  defaultProps?: Partial<Props>;
  shouldUpdate?: ScopedModelMemo<Props>;
}

export interface ScopedModel<Model, Props = unknown> {
  context: Context<ScopedModelRef<Model> | null>;
  Provider: React.FC<Props>;
  displayName: string;
}

/**
 * Creates a scoped model instance that generates a state from a given
 * React-based hook function which allows fine-grained control on injected
 * contextual state within the component tree.
 * @param useModelHook
 * @param options
 */
export default function createModel<Model, Props = unknown>(
  useModelHook: ScopedModelHook<Model, Props>,
  options: ScopedModelOptions<Props> = {},
): ScopedModel<Model, Props> {
  const context = createContext<ScopedModelRef<Model> | null>(null);
  const id = generateId();

  /**
   * Display name for the model
   */
  const displayName = options.displayName || `ScopedModel-${id}`;

  function useProcessor(props: Props) {
    const emitter = useContext(context);
    if (!emitter) {
      throw new MissingScopedModelError(displayName);
    }

    const model = useModelHook(props);

    emitter.model.sync(model);

    useIsomorphicEffect(() => {
      emitter.model.consume(model);

      if (emitter.subject) {
        emitter.subject.requestUpdate();
      }
    }, [emitter, model]);

    if (!emitter.subject) {
      emitter.subject = createExternalSubject({
        read: () => emitter.model.value,
        subscribe: (handler) => {
          emitter.model.on(handler);
          return () => {
            emitter.model.off(handler);
          };
        },
      });
    }

    useDebugValue(model);
  }

  const ProcessorInner = (props: Props) => {
    useProcessor(props);
    return null;
  };

  const Processor = memo(ProcessorInner, options.shouldUpdate);

  const Provider: FC<Props> = ({ children, ...props }) => {
    const emitter = useConstant(() => ({
      model: new Notifier<Model>(),
      subject: undefined,
    }));

    return (
      <context.Provider value={emitter}>
        <Processor {...props as any} />
        { children }
      </context.Provider>
    );
  };

  Provider.propTypes = options.propTypes;

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
    context.displayName = displayName;
  }

  return {
    context,
    Provider,
    displayName,
  };
}
