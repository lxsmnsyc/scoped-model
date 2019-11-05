# @lxsmnsyc/react-scoped-model

> Scoped Model pattern in React (but with Hooks)

[![NPM](https://img.shields.io/npm/v/@lxsmnsyc/react-scoped-model.svg)](https://www.npmjs.com/package/@lxsmnsyc/react-scoped-model) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @lxsmnsyc/react-scoped-model
```

## Usage

### Creating your Model

Models is just a hook that is always called whenever its Provider renders, but Models must follow the proper shape

```jsx
// import the createModel function
import createModel from '@lxsmnsyc/react-scoped-model';

// some hooks that we will need
import { useState, useCallback } from 'react';

/**
 * One of the basic models for state management, a model that has two actions:
 * - Increment = Adds 1 to count.
 * - Decrement = Subtracts 1 to count.
 */
const Counter = createModel(function () {
  // The state of our model
  const [count, setCount] = useState(0);

  // An action for our model
  const increment = useCallback(() => {
    // update the state by getting the current state, adding 1
    setCount(c => c + 1);
  }, []); // No dependencies means no new instances every update.

  const decrement = useCallback(() => {
    // update the state by getting the current state, subtracting 1
    setCount(c => c - 1);
  }, []);

  // Return the shape of our model
  return {
    state: {
      count,
    },
    action: {
      increment,
      decrement,
    },
  };
});

export default Counter;
```

### Adding to your component tree

To add the Model to your component tree, simply use the .Provider property

```jsx
export default function App() {
  return (
    <Counter.Provider>
      <Count />
      <Increment />
      <Decrement />
    </Counter.Provider>
  );
}
```

### Hooks

Models have two hooks in them (alongside the Provider component):
- useState: Subscribes to the state changes of the Model.
- useAction: Subscribe to the action changes of the Model.

Using them returns the corresponding property from the returned model.

```jsx
function Count() {
  const { count } = Counter.useState();

  return (
    <h1>Count: {count}</h1>
  );
}
```

```jsx
function Increment() {
  const { increment } = Counter.useAction();

  return (
    <button type="button" onClick={increment}>Increment</button>
  );
}
```

```jsx
function Decrement() {
  const { decrement } = Counter.useAction();

  return (
    <button type="button" onClick={decrement}>Decrement</button>
  );
}
```

In our Counter app, only the Count component re-renders whenever any of the Model actions are called.

### Shadowing Context

The concept of Scoped Model is that, unlike the Global state which all components have access to the state, Scoped Models only allows access within its component tree, this is comparable as to how "global variables vs local variables" work.

However, if we use the same Provider within the same tree, the model instance will be shadowed, which is similar to how scoped-based variables in JavaScript work:

```js
let x = 10;
if (true) {
  let x = 20;
  console.log('Shadowed X: ', x); // Shadowed X: 20
}
if (true) {
  console.log('Unshadowed X: ', x); // Unshadowed X: 10
}
console.log('Same-level X:', x); // Same-level X: 10
```


## Comparison to other Context-based State Libraries

### [Constate](https://github.com/diegohaz/constate)

A very similar library, although the problem here is that it is more of a wrapper to the existing Context API, as well as it performs the default comparison to the provided value, thus giving the Consumers of the value an unreasonable re-render if the returned value changes.

In react-scoped-model, Consumers can choose to listen for either the state changes or the action changes, giving a more reasonable re-render.

### [Provider](https://github.com/LXSMNSYC/react-provider)

The twin library of this package, both inspired by Flutter patterns. The difference here is that Provider is of general purpose depedency injection, as well as react-scoped-model allows the use of Hooks for reusable logic. react-scoped-model also employs a createContext-like approach (similar to constate).


## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
