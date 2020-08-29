# @lxsmnsyc/re-scoped-model

> Scoped Model pattern in React (but with Hooks), a pure ReasonML implementation of [react-scoped-model](https://github.com/LXSMNSYC/react-scoped-model)

[![NPM](https://img.shields.io/npm/v/@lxsmnsyc/re-scoped-model.svg)](https://www.npmjs.com/package/@lxsmnsyc/re-scoped-model) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @lxsmnsyc/re-scoped-model
```

```bash
yarn add @lxsmnsyc/re-scoped-model
```

### bsconfig.json

```json
  "bs-dependencies": [
    "@lxsmnsyc/re-scoped-model"
  ],
```

## Usage

### Creating a model

Models are created by using a hook function that is always called whenever its Provider renders, and must return an object that represents the models' state:

```reason
module Counter = {
  type props = int;

  type t = {
    decrement: unit => unit,
    increment: unit => unit,
    count: int,
  };

  let call = (props) => {
    let (count, setCount) = React.useState(() => props);

    let decrement = React.useCallback0(() => {
      setCount((current) => current - 1);
    });
    let increment = React.useCallback0(() => {
      setCount((current) => current + 1);
    });

    {
      count,
      decrement,
      increment,
    };
  };

  let displayName = "Counter";

  let shouldUpdate = (prev, next) => {
    prev == next;
  };
};

module CounterModel = ScopedModel.Make(Counter);
```


### Adding to your component tree

To add the Model to your component tree, simply use the `Provider` component property:

```reason
module App {
  [@react.component]
  let make = () => {
    <CounterModel.Provider props=0>
      <CounterModel.Provider props=100>
        <Count />
        <Increment />
        <Decrement />
      </CounterModel.Provider>
        <Count />
        <Increment />
        <Decrement />
    </CounterModel.Provider>
  };
}
```

### useSelector Hook

To access our model's state, we can use the `useSelector` hook which accepts the model's reference and a  function that receives the current model state, and returns a new value that is derived from the given state. This allows fine-grained and reasonable re-render for the listening component, as the component will only re-render if the transformed value changes every time the model updates. A third optional argument can be provided which accepts a function that compares the previously transformed state from the previous render and the newly transformed state.

For example, in our `Count` component, we only `select` the `count` field of our model record.

```reason
module Count {
  [@react.component]
  let make = () => {
    let count = ScopedModel.useSelector(Counter, state => state.count, None);

    Js.log("Count");

    <p>{ ReasonReact.string(string_of_int(count)) }</p>;
  }
}
```

```reason
module Increment {
  [@react.component]
  let make = () => {
    let increment = ScopedModel.useSelector(Counter, state => state.increment, None);

    Js.log("Increment");

    <button onClick={_ => increment()}>
      { ReasonReact.string("Increment") }
    </button>;
  }
}
```

```reason
module Decrement {
  [@react.component]
  let make = () => {
    let decrement = ScopedModel.useSelector(Counter, state => state.decrement, None);

    Js.log("Decrement");

    <button onClick={_ => decrement()}>
      { ReasonReact.string("Decrement") }
    </button>;
  }
}
```

```reason
module IncDec {
  [@react.component]
  let make = () => {
    let (increment, decrement) = Counter.useSelector(state => (
      state.increment,
      state.decrement,
    ), true);

    Js.log("IncDec");

    <React.Fragment>
      <button onClick={_ => increment()}>
        { ReasonReact.string("Increment") }
      </button>
      <button onClick={_ => decrement()}>
        { ReasonReact.string("Decrement") }
      </button>
    </React.Fragment>
  };
}
```

### Other hooks

There are 3 other hooks:
- `useValue`: Consumes the model's current state and updates when the model's state updates.
- `useValueOnce`: Consumes the model's current state once.
- `useSelectorOnce`: Similar to `useSelector`, consumes and transforms the model's current state once.

## Hook Factories

There are 4 built-in functions that are higher-order hooks. These functions are beneficial for stabilizing functional references (e.g. selector functions) to prevent recomputation of internal side effects.

- `createValue`
- `createValueOnce`
- `createSelector`
- `createSelectorOnce`

## Model Factories

- `MakeNullary` - a model with unit props, stabilizing the model from further recomputation whenever the `Provider` updates props or children.
- `MakeState` - a kind of nullary model whose state is that of the `React.useState`.
```reason
module Count = MakeState({
  type state = int;

  let initialState = () => 0;

  let displayName = "Count";
});
```
- `MakeReducer` - a kind of nullary model whose state is that of the `React.useReducer`.
```reason
module Count = MakeReducer({
  type state = int;
  
  type action = 
    | Increment
    | Decrement;

  let initialState = () => 0;

  let reducer = (state, action) => {
    switch (action) {
      | Increment => state + 1;
      | Decrement => state - 1;
    }
  };

  let displayName = "Count";
});
```
- `MakePropSelector`- a kind of model whose props and state are the same.

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
