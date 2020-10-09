/** @jsx h */
import { Fragment, h, VNode } from 'preact';
import { Suspense } from 'preact/compat';
import { useCallback } from 'preact/hooks';
import {
  createGraphNodeResource,
  createGraphNode,
} from 'graph-state';
import {
  GraphDomain,
  useGraphNodeResource,
  useGraphNodeValue,
  useGraphNodeState,
} from 'preact-graph-state';

const temperatureF = createGraphNode({
  get: 32,
});

const temperatureC = createGraphNode<number, number>({
  get: ({ get }) => {
    const fahrenheit = get(temperatureF);

    return ((fahrenheit - 32) * 5) / 9;
  },
  set: ({ set }, newValue) => {
    set(temperatureF, (newValue * 9) / 5 + 32);
  },
});

const sleep = (time: number) => new Promise((resolve) => {
  setTimeout(resolve, time, true);
});

const temperature = createGraphNode<Promise<string>>({
  get: async ({ get }) => {
    const fahrenheit = get(temperatureF);
    const celsius = get(temperatureC);

    await sleep(1000);

    return `${fahrenheit} vs ${celsius}`;
  },
});

const asyncTemperature = createGraphNodeResource(temperature);

function Celsius(): VNode {
  const [celsius, setCelsius] = useGraphNodeState(temperatureC);

  const onChange = useCallback((e: h.JSX.TargetedEvent<HTMLInputElement>) => {
    setCelsius(Number.parseFloat(e.currentTarget.value));
  }, [setCelsius]);

  return (
    <input
      type="number"
      onChange={onChange}
      value={celsius}
    />
  );
}

function Fahrenheit(): VNode {
  const [fahrenheit, setFahrenheit] = useGraphNodeState(temperatureF);

  const onChange = useCallback((e: h.JSX.TargetedEvent<HTMLInputElement>) => {
    setFahrenheit(Number.parseFloat(e.currentTarget.value));
  }, [setFahrenheit]);

  return (
    <input
      type="number"
      onChange={onChange}
      value={fahrenheit}
    />
  );
}

function Temperature(): VNode {
  const celsius = useGraphNodeValue(temperatureC);
  const fahrenheit = useGraphNodeValue(temperatureF);

  return (
    <Fragment>
      <h1>{`Celsius: ${celsius}`}</h1>
      <h1>{`Fahrenheit: ${fahrenheit}`}</h1>
    </Fragment>
  );
}

function DelayedTemperature(): VNode {
  const value = useGraphNodeResource(asyncTemperature);

  return <h1>{ value }</h1>;
}

function AsyncTemperature(): VNode {
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
  get: ({ set }) => {
    let count = 0;
    setInterval(() => {
      count += 1;
      set(count);
    }, 1000);
    return count;
  },
});

function Timer(): VNode {
  const value = useGraphNodeValue(timer);

  return <h1>{`Time: ${value}`}</h1>;
}

export default function App(): VNode {
  return (
    <GraphDomain>
      <Celsius />
      <Fahrenheit />
      <Temperature />
      <Suspense fallback={<h1>Loading...</h1>}>
        <DelayedTemperature />
      </Suspense>
      <AsyncTemperature />
      <Timer />
    </GraphDomain>
  );
}
