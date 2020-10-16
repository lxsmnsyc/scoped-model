# swr-graph-state

> SWR + `graph-state`

[![NPM](https://img.shields.io/npm/v/swr-graph-state.svg)](https://www.npmjs.com/package/swr-graph-state) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

## Install

```bash
yarn add graph-state swr-graph-state
```

## Usage

### Creating an SWR graph node

SWR Graph nodes are similar to basic graph nodes but instead of returning a node, it returns an interface.

To create an SWR graph node, you must pass a single object for `createSWRGraphNode` which accepts the following properties:
- `fetch`: A callback similar to the `get` property of basic graph nodes. The difference is that the `fetch` callback gets called conditionally through revalidation.
- `key`: Optional. Used for customizing node keys.

With an additional base options shared with the factory:
- `revalidateOnFocus`: `boolean`. Revalidates the cache when the page is focused. Defaults to `false`.
- `revalidateOnVisibility`: `boolean`. Revalidates the cache when the page is visible.Defaults to `false`.
- `revalidateOnNetwork`: `boolean`. Revalidates the cache when the network connectivity goes back online. Defaults to `false`.
- `ssr`: Allow fetching on server-side. Defaults to `false`.
- `initialData`: Optional. Hydrates the cache on node creation, resulting on `success` state on initial render. If not provided, SWR graph nodes begins with `pending` state.

Upon creation, the function returns not a node, but an interface that provides a way to mutate and revalidate the cache:

- `resource`: The fetching graph node resource.
- `mutate(data: T, shouldRevalidate = true)`: Synchronously mutates the cache. May sychronously revalidate the cache.
- `trigger(shouldRevalidate = true)`: Sychronously revalidates the cache.

### Example
```tsx
import React, { Suspense } from 'react';
import { createGraphNode } from 'graph-state';
import { createSWRGraphNode } from 'swr-graph-state';
import {
  GraphDomain,
  useGraphNodeResource,
} from 'react-graph-state';

const API = 'https://dog.ceo/api/breed/';
const API_SUFFIX = '/images/random';

interface APIResult {
  message: string;
  status: string;
}

const dogBreed = createGraphNode({
  get: 'shiba',
});

const dogAPI = createSWRGraphNode<APIResult | undefined>({
  fetch: async ({ get }) => {
    const breed = get(dogBreed);
    const response = await fetch(`${API}${breed}${API_SUFFIX}`);
    return (await response.json()) as APIResult;
  },
  revalidateOnFocus: true,
  revalidateOnNetwork: true,
  revalidateOnVisibility: true,
  initialData: undefined,
  ssr: false,
});

function DogImage(): JSX.Element {
  const data = useGraphNodeResource(dogAPI.resource);

  if (data) {
    return <img src={data.message} alt={data.message} />;
  }

  return <></>;
}

function Trigger(): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => {
        dogAPI.trigger();
      }}
    >
      Trigger
    </button>
  );
}

export default function App(): JSX.Element {
  return (
    <GraphDomain>
      <Trigger />
      <div>
        <Suspense fallback={<h1>Loading...</h1>}>
          <DogImage />
        </Suspense>
      </div>
    </GraphDomain>
  );
}
```

### SWR Graph Node Factory

Similar to `createSWRGraphNode` with the following differences:
- `fetch`: `fetch` here is a higher-order function that receives parameters and returns the `fetch` callback.
- `key`: Required. `key` is a function that generates a string key derived from the received arguments.

`createSWRGraphNodeFactory` returns similar fields to `createSWRGraphNode` with the following differences:
- `mutate`: first parameter is the array of arguments for generating the key.
- `trigger`: first parameter is the array of arguments for generating the key.
- `resource`: Replaced by a graph node factory, and accepts similar arguments that is expected by `fetch` and `key`.

### SSR

If a graph node has no `initialData` provided nor wasn't hydrated using `mutate`, SWR Graph nodes may throw an error indicating an attempt to prefetch data on server-side. To solve this, either provide an `initialData` value or call `mutate` before accessing the instance, or allow server-side prefetching with setting `options.ssr` to true.

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)