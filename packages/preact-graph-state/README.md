# preact-graph-state

> Preact bindings for `graph-state`

[![NPM](https://img.shields.io/npm/v/preact-graph-state.svg)](https://www.npmjs.com/package/preact-graph-state) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

## Install

```bash
yarn add graph-state
yarn add preact-graph-state
```

```bash
npm install graph-state
npm install preact-graph-state
```

## Usage

### Accessing a graph node

Graph nodes, by themselves, are meaningless. They needed a domain to begin computing. `<GraphDomain>` is a component that defines such domain where all graph nodes live.

```tsx
import { GraphDomain } from 'preact-graph-state`;

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
- `useGraphNodeResource`: treats the graph node as a valid Preact resource, suspending the component if the graph node's resource is pending.
- `useGraphNodeSnapshot`: attaches a listener to the node for state updates.

If one of these hooks are used to access a graph node, that graph node is registered within `<GraphDomain>` and creates a lifecycle.

#### Hooks

##### `useGraphNodeValue`

This is a Preact hook that reads the graph node's current state and subscribes to further state updates.

```tsx
function Message() {
  const message = useGraphNodeValue(messageNode);

  return <h1>{ message }</h1>;
}
```

##### `useGraphNodeSetValue`

This is a Preact hook that returns a callback similar to `setState` that allows state mutation for the given graph node.

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

##### `useGraphNodeSnapshot`

This is a hook that attaches a listener to a graph node and subscribes for state updates.

```tsx
useGraphNodeSnapshot(node, (state) => {
  console.log('Received', state);
});
```

##### `useGraphNodeResource`

This is a hook that receives a valid graph node resource and suspends the component until the resource is successful. This may resuspend the component if the resource updates itself.

### Graph Node Resources

Accessing a graph node resource using `useGraphNodeValue` returns an object which represents the Promise result.

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

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
