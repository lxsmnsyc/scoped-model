# Create Model

A `scoped model` represents a shared business logic within a local component tree. Components within the same parent, which is the provider of the `scoped model`, can access the `scoped model`'s state and can update immediately whenever the state updates.

In `preact-scoped-model`, `scoped model`'s business logic and state relies on the use of React hooks.

## Usage

### Importing

`createModel`, the function for creating scoped models, is exported as default from the package.

```ts
import createModel from 'preact-scoped-model';
```

### Creating a model

The `createModel` function accepts two parameters:

- `modelHook`: A hook function based on Preact hooks that provides the business logic for model. The value returned from the hook serves as the state of the model.
- `options`: Optional.
  - `displayName`: Serves as the display name for both the model (for error logs) and the `Provider` component.
  - `shouldUpdate`: Serves as condition for render memoization or "when should the `<Provider>` component re-render given the new props. This is similar to `React.PureComponent`'s `shouldUpdate`.
  - `shouldNotify`: Serves as condition for state memoization.
  - `defaultProps`

The model returns an object with the property `Provider` which injects the model state as well as runs the model hook within the component tree.

```ts
/**
 * One of the basic models for state management, a model that has two actions:
 * - Increment = Adds 1 to count.
 * - Decrement = Subtracts 1 to count.
 */
const Counter = createModel(() => {
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
```

### Mounting a model

To mount a model to our app, we can use the `Provider` component provided as a property from our instances.

```tsx
<Counter.Provider>
  {/* children */}
</Counter.Provider>
```

Components added to the children can always access the model's state.

Model hooks can also access props provided through the `Provider` component.

```tsx
<Counter.Provider initial={0}>
  {/* */}
</Counter.Provider>

// Model
const Counter = createModel(({ initial }) => {
  const [state, setState] = useState(initial);
  // ...
});
```

If the model itself is mounted as a children from the same instance, components within that model will access a different state from the parent model. This is what you call "context shadowing".

```tsx
<Counter.Provider initial={0}>
  {/* Children here will receive the state of 0 */}
  <Counter.Provider initial={100}>
     {/* Children here will receive the state of 100 */}
  </Counter.Provider>
  {/* Children here will receive the state of 0 */}
</Counter.Provider>
```

Components outside of the model's component tree that attempts to access it's state will throw an error.

## See Also

- [Model Factory](/packages/preact-scoped-model/docs/model-factory.md)
- [Hook Factory](/packages/preact-scoped-model/docs/hook-factory.md)
- [Hooks](/packages/preact-scoped-model/docs/hooks/README.md)
