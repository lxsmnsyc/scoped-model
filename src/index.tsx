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
import createModel from './create-model';

// Model factory
export { default as createStateModel } from './create-state-model';
export { default as createReducerModel } from './create-reducer-model';
export { default as createPropsSelectorModel } from './create-props-selector-model';

// Hooks
export { default as useScopedModelState } from './hooks/useScopedModelState';
export { default as useScopedModelSelector } from './hooks/useScopedModelSelector';
export { default as useScopedModelSelectors } from './hooks/useScopedModelSelectors';
export { default as useScopedModelAsyncSelector } from './hooks/useScopedModelAsyncSelector';
export { default as useScopedModelSuspenseSelector } from './hooks/useScopedModelSuspenseSelector';
export { default as useScopedModelSuspendedState } from './hooks/useScopedModelSuspendedState';
export { default as useValue } from './hooks/useScopedModelState';
export { default as useSelector } from './hooks/useScopedModelSelector';
export { default as useSelectors } from './hooks/useScopedModelSelectors';
export { default as useAsyncSelector } from './hooks/useScopedModelAsyncSelector';
export { default as useSuspenseSelector } from './hooks/useScopedModelSuspenseSelector';
export { default as useSuspendedState } from './hooks/useScopedModelSuspendedState';

// Types
export { ModelHook, ModelOptions, ScopedModel } from './create-model';
export { StateScopedModel } from './create-state-model';
export { ReducerScopedModel } from './create-reducer-model';
export { PropsSelectorModel } from './create-props-selector-model';
export { SuspendSelector } from './hooks/useScopedModelSuspendedState';

export default createModel;
