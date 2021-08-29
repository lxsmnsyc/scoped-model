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
import { MutableRefObject } from 'react';

export type Listener<T> = (value: T) => void;

export default class Notifier<T> {
  private alive = true;

  private ref?: MutableRefObject<T>;

  public initialized = false;

  private listeners = new Set<Listener<T>>();

  subscribe(callback: Listener<T>): () => void {
    if (this.alive) {
      this.listeners.add(callback);
    }
    return () => {
      if (this.alive) {
        this.listeners.delete(callback);
      }
    };
  }

  consume(value: T): void {
    if (this.alive) {
      this.ref = {
        current: value,
      };
      for (const listener of this.listeners.keys()) {
        listener(value);
      }
    }
  }

  hydrate(value: T): void {
    if (this.alive && !this.initialized) {
      this.ref = {
        current: value,
      };
    }
  }

  hasValue(): boolean {
    return !!this.ref;
  }

  get value(): T {
    if (this.ref == null) {
      throw new Error('Unexpected missing model reference.');
    }
    return this.ref.current;
  }

  public destroy(): void {
    if (this.alive) {
      this.listeners.clear();
      this.alive = false;
    }
  }
}
