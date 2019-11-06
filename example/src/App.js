import React from 'react'

import Counter from './Counter'

function Count() {
  const count = Counter.useProperty('count');

  return (
    <h1>Count: {count}</h1>
  );
}

function Increment() {
  const increment = Counter.useProperty('increment');
  console.log('Re-rendered Increment');
  return (
    <button type="button" onClick={increment}>Increment</button>
  );
}

function Decrement() {
  const decrement = Counter.useProperty('decrement');
  console.log('Re-rendered Decrement');
  return (
    <button type="button" onClick={decrement}>Decrement</button>
  );
}

export default function App() {
  return (
    <Counter.Provider>
      <Counter.Provider>
        <Count />
        <Increment />
        <Decrement />
      </Counter.Provider>
      <Count />
      <Increment />
      <Decrement />
    </Counter.Provider>
  );
}