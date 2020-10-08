# graph-state

> Digraph-based state management

[![NPM](https://img.shields.io/npm/v/graph-state.svg)](https://www.npmjs.com/package/graph-state) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

## Install

```bash
yarn add graph-state
```

```bash
npm install graph-state
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
* `set`: Optional. Registers a dispatch side-effect. When defined, prevents state mutation for the graph node and must rely on dependency recomputation. This function is invoked when the graph node is scheduled for state update. The function receives two parameters:
  * `{ get, set }`: An interface for controlling graph nodes.
    * `get(node)`: Reads the node's value. Unlike `get`, the node is not treated as a dependency and therefore `set` won't be invoked when dependencies update.
    * `set(node, action)`: Dispatches a node.
  * `newValue`: The new state for the graph node.
* `key`: Optional. Uses the provided key instead of a generated key. Provided key may be shared, although `get` and `set` functions may be different depending on the node instance passed. Use with caution.

```tsx
import { createGraphNode } from 'react-graph-state`;

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

#### Graph node rules

##### Graph nodes are immutable.

Once they are created, they can never be destroyed. Be mindful of your graph node logic.

##### Graph nodes of the same key share the same instance.

When creating graph nodes of the same key, the first one is returned. This is to prevent polluting the graph domain for unnecessary creation of node instances.

### Graph Node Resources

Graph nodes can have synchronous or asynchronous states, but having raw asynchronous states like in in React (aka Promises) can be a bit tedious to handle specially for race conditions. `createGraphNodeResource` attempts to leverage this problem by turning asynchronous states into reactive Promise results.

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

### Factories

Graph node factories allows you to dynamically generate graph nodes of similar logic based on parameters.

Factories has similar option fields for basic graph node creation, but the difference is that these options are higher-order functions instead.
- `key`: Optional. Function for generating graph node keys. If not provided, keys are generated from encoding the parameter array into valid JSON string.
- `get`: Function for generating graph node values.
- `set`: Optional. Function for generating graph node side-effects.

```tsx
import { createGraphNodeFactory } from 'react-graph-state';

// Parameters for each factory field are shared.
const userDataFactory = createGraphNodeFactory({
  // Generate key based on parameter
  key: (id) => id,
  // Get user by id
  get: (id) => () => getUserById(id),
})
```

Factories with Promise-returning graph nodes can be wrapped with `createGraphNodeResourceFactory`, which automatically converts the generated Promises into Resources.

```tsx
const userDataResourceFactory = createGraphNodeResourceFactory(userDataFactory);
```

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)