# @lxsmnsyc/react-scoped-model

> Scoped Model pattern in React (but with Hooks)

[![NPM](https://img.shields.io/npm/v/@lxsmnsyc/react-scoped-model.svg)](https://www.npmjs.com/package/@lxsmnsyc/react-scoped-model) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Features

- Contextual State: Inject state into your component tree.
- Composition: Write states as if you are writing components, use React Hooks to compose state logic.
- Granular control: Only watch updates you need, not when the whole state updates.

## Install

```bash
npm install --save @lxsmnsyc/react-scoped-model
```

## Usage

### Creating your Model

Models are created by using a hook function that is always called whenever its Provider renders, and must return an object that represents the models' state:

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

  // Another action
  const decrement = useCallback(() => {
    // update the state by getting the current state, subtracting 1
    setCount(c => c - 1);
  }, []);

  // Return the shape of our model
  return {
    count,
    increment,
    decrement,
  };
});

export default Counter;
```

### Adding to your component tree

To add the Model to your component tree, simply use the `Provider` component property:

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

### Getting the current state

The created model comes with a hook called `useValue` which returns the current state of the model

```jsx
const { count, increment, decrement } = Counter.useValue();
```

### Selectors

If the model's shape is complex (e.g. deeply nested) and/or you only want to listen to specific changes e.g. transforming a value, you can use the `useSelector` and `useSelectors` hook to listen to your transformed state value.

```jsx
function Count() {
  const count = Counter.useSelector(state => state.count);

  return (
    <h1>Count: {count}</h1>
  );
}
```

```jsx
function IncDec() {
  const [increment, decrement] = Counter.useSelectors((state) => [
    state.increment, 
    state.decrement,
  ]);
  return (
    <React.Fragment>
      <button type="button" onClick={increment}>Increment</button>
      <button type="button" onClick={decrement}>Decrement</button>
    </React.Fragment>
  );
}
```

Both hooks also accepts a second optional parameter which allows a custom comparison function for the previously transformed value and the newly transformed value, allowing a fine-grained control on re-rendering the component.

### Asynchronous Selectors

We also have asynchronous selectors which allows you to return a Promise-based value instead of a value. Unlike synchronous selectors, async selectors do not get their values compared.

Asynchronous selectors requires a second parameter called 'key', which is used for caching.

```jsx
function AsyncCount() {
  const state = Counter.useAsyncSelector(async (state) => {
    await sleep(500);

    return state.count;
  });


  switch (state.status) {
    case 'failure': return <h1>An error occured.</h1>;
    case 'success': return <h1>Count: {state.data}</h1>;
    case 'pending': return <h1>Loading...</h1>;
    default: 
  }
}
```

### Suspended Selector

Like asynchronous selectors but for Suspense mode.

```jsx
function SuspendedCount() {
  const count = Counter.useSuspendedSelector(async (state) => {
    await sleep(500);

    return state.count;
  }, 'count/suspended');

  return (
    <h1>Count: {count}</h1>
  );
}
```

### Suspended State

If you ever wanted to indefinitely suspend the component,

```jsx
function SuspendedState() {
  const count = Counter.useSuspendedState((state) => ({
    count: state.count,
    suspend: state.count < 5,
  }), 'state/suspended');

  return (
    <h1>Count: {count}</h1>
  );
}
```

### Props

A model can also receive props:

```jsx
const MyModel = createModel(({ initialValue }) => /* code */);
```

```jsx
<MyModel.Provider initialValue="Hello World">
 ...
</MyModel.Provider>
```

### Options

A model can also receive an option:

```jsx
const MyModel = createModel(myHook, {
  displayName: 'MyModel',
});
```

Useful for inspecting your model with React DevTools, as well as receive expressive errors whenever
you try to use the scoped model hooks assuming that the model is mounted to the component tree.

The option can also have `propTypes` and `defaultProps` from the `prop-types` module.

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
