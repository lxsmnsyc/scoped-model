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
export {
  default as createStateModel,
  StateScopedModel,
} from './model-factory/create-state-model';
export {
  default as createReducerModel,
  ReducerScopedModel,
} from './model-factory/create-reducer-model';
export {
  default as createPropsSelectorModel,
  PropsSelectorModel,
} from './model-factory/create-props-selector-model';

// Hook Factory
export { default as createSelector } from './hook-factory/create-selector-hook';
export { default as createSelectors } from './hook-factory/create-selectors-hook';
export { default as createAsyncSelector } from './hook-factory/create-async-selector-hook';
export { default as createSuspendedState } from './hook-factory/create-suspended-state-hook';
export { default as createSuspenseSelector } from './hook-factory/create-suspense-selector-hook';
export { default as createValue } from './hook-factory/create-value-hook';

// Hooks
export { default as useValue } from './hooks/useValue';
export { default as useSelector } from './hooks/useSelector';
export { default as useSelectors } from './hooks/useSelectors';
export { default as useAsyncSelector } from './hooks/useAsyncSelector';
export { default as useSuspenseSelector } from './hooks/useSuspenseSelector';
export { default as useSuspendedState, SuspendSelector } from './hooks/useSuspendedState';

export * from './types';
export * from './create-model';

export default createModel;
