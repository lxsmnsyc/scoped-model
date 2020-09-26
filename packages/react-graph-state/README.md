# @lxsmnsyc/react-graph-state

> Digraph-based state management library for React

[![NPM](https://img.shields.io/npm/v/@lxsmnsyc/react-graph-state.svg)](https://www.npmjs.com/package/@lxsmnsyc/react-graph-state) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

## Install

```bash
yarn add @lxsmnsyc/react-graph-state
```

```bash
npm install @lxsmnsyc/react-graph-state
```

## Usage

### What is a Graph State?

A `Graph State` is a kind of a state management structure that aims to build a container states that behaves like a dependency graph. The structure are made up of `graph nodes`, which represent an atomic state. Each `graph node` may depend from another `graph node` instance. When a `graph node` state updates, all of its dependents react immediately from their dependency's new state, and in turn, updates their own state, which can go on until there are no dependents left.

### Creating a Graph Node

To create a graph node, you must invoke the `createGraphNode` function. This function an object with 1 required field and 2 optional fields.
* `get`: acts as a default value. If a function is supplied, the function is lazily evaluated as it enters the `GraphDomain` to provide the default value. This function may also be invoked again if the dependencies update. The function an object with 2 fields:
  * `{ get, set }`: An interface for controlling graph nodes.
    * `get(dependencyNode)`: Registers the `dependencyNode` as a dependency and returns the dependency's current state. If the `dependencyNode` updates its state at some point, the created graph node reacts to the state and
    invokes the `get` function to recompute and produce the new state.
    * `set(newValue)`: Sets the new state for the graph node.
* `set`: Optional. Registers a state mutation side-effect. This function is invoked when the graph node is scheduled for state update. The function receives two parameters:
  * `{ get, set }`: An interface for controlling graph nodes.
    * `get(node)`: Reads the node's value. Unlike `get`, the node is not treated as a dependency and therefore `set` won't be invoked when dependencies update.
    * `set(node, action)`: Mutates the node's state. `action` may be a value or a function that receives the current state of the node and returns the new state, similar to `useState`'s `setState`.
  * `newValue`: The new state for the graph node.
* `key`: Optional. Uses the provided key instead of a generated key. Provided key may be shared, although `get` and `set` functions may be different depending on the node instance passed. Use with caution.

```tsx
import { createGraphNode } from '@lxsmnsyc/react-graph-state`;

// A basic node
const basicNode = createGraphNode({
  get: 'Hello',
});

// A dependent node
const dependentNode = createGraphNode({
  get: ({ get }) => {
    const basic = get(basicNode);

    return `${basic}, World!`;
  },
});

// A self-updating node
const timer = createGraphNode({
  get: ({ set }) => {
    let count = 0;
    setInterval(() => {
      count += 1;
      set(count);
    }, 1000);
    return count;
  },
});

const temperatureF = createGraphNode({
  get: 32,
});

const temperatureC = createGraphNode({
  get: ({ get }) => {
    const fahrenheit = get(temperatureF);

    return (fahrenheit - 32) * 5 / 9;
  },
  set: ({ set }, newValue) => {
    set(temperatureF, (newValue * 9) / 5 + 32);
  },
});

```

### Accessing a graph node

Graph nodes, by themselves, are meaningless. They needed a domain to begin computing. `<GraphDomain>` is a component that defines such domain where all graph nodes live.

```tsx
import { GraphDomain } from '@lxsmnsyc/react-graph-state`;

const messageNode = createGraphNode({
  get: 'Hello World',
});

function App() {
  return (
    <GraphDomain>
      {/* children */}
    </GraphDomain>
  );
}
```

There are also three hooks:
- `useGraphNodeValue`: reads a graph node's value. Subscribes to the graph node's state updates.
- `useGraphNodeSetValue`: provides a callback that allows graph node's state mutation.
- `useGraphNodeResource`: treats the graph node as a valid React resource, suspending the component if the graph node's resource is pending.

If one of these hooks are used to access a graph node, that graph node is registered within `<GraphDomain>` and creates a lifecycle.

#### Hooks

##### `useGraphNodeValue`

This is a React hook that reads the graph node's current state and subscribes to further state updates.

```tsx
function Message() {
  const message = useGraphNodeValue(messageNode);

  return <h1>{ message }</h1>;
}
```

##### `useGraphNodeSetValue`

This is a React hook that returns a callback similar to `setState` that allows state mutation for the given graph node.

```tsx
function MessageInput() {
  const setMessage = useGraphNodeSetValue(messageNode);

  const onChange = useCallback((e) => {
    setFahrenheit(Number.parseFloat(e.currentTarget.value));
  }, []);

  return (
    <input
      type="text"
      onChange={onChange}
    />
  );
}
```

##### `useGraphNodeResource`

This is a hook that receives a valid graph node resource and suspends the component until the resource is successful. This may resuspend the component if the resource updates itself.

### Graph Node Resources

Graph nodes can have synchronous or asynchronous states, but having raw asynchronous states in React (aka Promises) can be a bit tedious to handle specially for race conditions. `createGraphNodeResource` attempts to leverage this problem by turning asynchronous states into reactive Promise results.

```tsx
/**
 * This is an asynchronous graph node. Trying to
 * access this node using `useGraphNodeValue` just
 * returns a Promise instance. Writing hooks for
 * handling Promise state and side-effects is a
 * tedious task.
 */
const asyncUserNode = createGraphNode(
  get: async ({ get }) => {
    // Get current user id
    const id = get(userIdNode);

    // Fetch user data
    const response = await fetch(`/users/${id}`);

    return response.json();
  },
);

/**
 * Let's transform asyncUserNode into
 * a valid React resource node!
 * 
 * This allows us to receive Promise results,
 * react-graph-state already handles race condition
 * and state updates for us!
 */
const userResourceNode = createGraphNodeResource(asyncUserNode);
```

Accessing `userResourceNode` using `useGraphNodeValue` returns an object which represents the Promise result.

```tsx
function UserProfile() {
  const result = useGraphNodeValue(userResourceNode);

  if (result.status === 'pending') {
    return <h1>Loading...</h1>;
  }
  if (result.status === 'failure') {
    return <h1>Something went wrong.</h1>;
  }
  return <UserProfileInternal data={result.data} />;
}
```

There's also another hook called `useGraphNodeResource` which allows us to suspend the component until the resource is successful.

```tsx
function UserProfileInternal() {
  const data = useGraphNodeResource(userResourceNode);

  return (
    <UserProfileContainer>
      <UserProfileName>{ data.name }</UserProfileName>
      <UserProfileDescription>{ data.description }</UserProfileDescription>
    </UserProfile>
  );
}

function UserProfile() {
  return (
    <ErrorBoundary fallback={<h1>Something went wrong.</h1>}>
      <Suspense fallback={<h1>Loading...</h1>}>
        <UserProfileInternal />
      </Suspense>
    </ErrorBoundary>
  );
}
```
### Resource-related constructors

#### `fromResource`

Converts a graph node resource into a promise-based graph node.

```tsx
const rawUserDataNode = createGraphNode({
  get: async ({ get }) => fromResource(userResourceNode),
})
```

#### `waitForAll`

Waits for an array of graph node resources to resolve. This is similar in behavior with `Promise.all`. If one of the resources updates, `waitForAll` returns to pending state untill all Promise has resolved again.

```tsx
const resourceA = createGraphNodeResource(
  createGraphNode({
    get: async () => {
      await sleep(1000);
      return 'Message A';
    },
  }),
);
const resourceB = createGraphNodeResource(
  createGraphNode({
    get: async () => {
      await sleep(2000);
      return 'Message B';
    },
  }),
);
const resourceC = createGraphNodeResource(
  createGraphNode({
    get: async () => {
      await sleep(3000);
      return 'Message C';
    },
  }),
);

const values = waitForAll([
  resourceA,
  resourceB,
  resourceC,
]); // ['Message A', 'Message B', 'Message C'] after 3 seconds.
```

#### `waitForAny`

Waits for an array of graph node resources to resolve. This is similar in behavior with `Promise.race`. If one of the resources updates, `waitForAny` returns to pending state untill any Promise has resolved again.

```tsx
const resourceA = createGraphNodeResource(
  createGraphNode({
    get: async () => {
      await sleep(1000);
      return 'Message A';
    },
  }),
);
const resourceB = createGraphNodeResource(
  createGraphNode({
    get: async () => {
      await sleep(2000);
      return 'Message B';
    },
  }),
);
const resourceC = createGraphNodeResource(
  createGraphNode({
    get: async () => {
      await sleep(3000);
      return 'Message C';
    },
  }),
);

const values = waitForAny([
  resourceA,
  resourceB,
  resourceC,
]); // 'Message A'
```

#### `joinResources`

Joins an array of graph node resources into a single graph node that emits an array of resource results.

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
