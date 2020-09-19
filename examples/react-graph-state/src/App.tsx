import React, { Suspense, useCallback } from 'react';
import {
  createGraphNodeResource,
  createGraphNode,
  GraphDomain,
  useGraphNodeResource,
  useGraphNodeSetValue,
  useGraphNodeValue,
} from '@lxsmnsyc/react-graph-state';

const temperatureF = createGraphNode({
  get: 32,
});

const temperatureC = createGraphNode<number>({
  get: (get) => {
    const fahrenheit = get(temperatureF);

    return (fahrenheit - 32) * 5 / 9;
  },
  set: (_, set, newValue) => {
    set(temperatureF, (newValue * 9) / 5 + 32);
  },
});

const sleep = (time: number) => new Promise((resolve) => {
  setTimeout(resolve, time, true);
});

const temperature = createGraphNode({
  get: async (get) => {
    const fahrenheit = get(temperatureF);
    const celsius = get(temperatureC);

    await sleep(1000);

    return `${fahrenheit} vs ${celsius}`;
  },
});

const asyncTemperature = createGraphNodeResource(temperature);

function Celsius(): JSX.Element {
  const celsius = useGraphNodeValue(temperatureC);
  const setCelsius = useGraphNodeSetValue(temperatureC);

  const onChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setCelsius(Number.parseFloat(e.currentTarget.value));
  }, []);

  return (
    <input
      type="number"
      onChange={onChange}
      value={celsius}
    />
  );
}

function Fahrenheit(): JSX.Element {
  const fahrenheit = useGraphNodeValue(temperatureF);
  const setFahrenheit = useGraphNodeSetValue(temperatureF);

  const onChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setFahrenheit(Number.parseFloat(e.currentTarget.value));
  }, []);

  return (
    <input
      type="number"
      onChange={onChange}
      value={fahrenheit}
    />
  );
}

function Temperature(): JSX.Element {
  const celsius = useGraphNodeValue(temperatureC);
  const fahrenheit = useGraphNodeValue(temperatureF);

  return (
    <>
      <h1>{`Celsius: ${ celsius }`}</h1>
      <h1>{`Fahrenheit: ${ fahrenheit }`}</h1>
    </>
  );
}

function DelayedTemperature(): JSX.Element {
  const value = useGraphNodeResource(asyncTemperature);
  
  return <h1>{ value }</h1>
}

function AsyncTemperature(): JSX.Element {
  const value = useGraphNodeValue(asyncTemperature);

  if (value.status === 'pending') {
    return <h1>Loading...</h1>;
  }
  if (value.status === 'failure') {
    return <h1>Something went wrong.</h1>;
  }
  return <h1>{ value.data }</h1>;
}

const timer = createGraphNode<number>({
  get: (_, set) => {
    let count = 0;
    setInterval(() => {
      count += 1;
      set(count);
    }, 1000);
    return count;
  },
});

function Timer(): JSX.Element {
  const value = useGraphNodeValue(timer);

  return <h1>{`Time: ${value}`}</h1>;
}

export default function App(): JSX.Element {
  return (
    <GraphDomain>
      <Fahrenheit />
      <Celsius />
      <Temperature />
      <Suspense fallback={<h1>Loading...</h1>}>
        <DelayedTemperature />
      </Suspense>
      <AsyncTemperature />
      <Timer />
    </GraphDomain>
  );
}
