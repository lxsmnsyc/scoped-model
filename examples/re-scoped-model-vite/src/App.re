open ReScopedModel;

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

module Count = {
  let useCount = ScopedModel.createSelector(CounterModel.reference, (state) => (
    state.count
  ), None);

  [@react.component]
  let make = () => {
    let count = useCount();

    <h1>
      {ReasonReact.string("Count: " ++ string_of_int(count))}
    </h1>
  };
};

module Increment = {
  let useIncrement = ScopedModel.createSelector(CounterModel.reference, (state) => (
    state.increment
  ), None);

  [@react.component]
  let make = () => {
    let increment = useIncrement();

    <button onClick={_ => increment()}>
      {ReasonReact.string("Increment")}
    </button>
  };
};


module Decrement = {
  let useDecrement = ScopedModel.createSelector(CounterModel.reference, (state) => (
    state.decrement
  ), None);

  [@react.component]
  let make = () => {
    let decrement = useDecrement();

    <button onClick={_ => decrement()}>
      {ReasonReact.string("Decrement")}
    </button>
  };
};

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
