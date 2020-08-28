# Model Factory

`preact-scoped-model` provides a set of functions to create `scoped model` instances with predefined business logic based on Preact Hooks and other utilities.

## List of Model Factories

- `createNullaryModel`: creates a scoped model that doesn't need a props. The syntax is similar to `createModel` but the options only accept the `displayName` property.

- `createStateModel`: creates a scoped model based on `useState` hook.

```tsx
import { createStateModel } from '@lxsmnsyc/preact-scoped-model';

const Counter = createStateModel(0);

// ...
<Counter.Provider>
  {/* ... */}
</Counter.Provider>

// ...
const [state, setState] = useValue(Counter);
```

- `createReducerModel`: creates a scoped model based on `useReducer` hook.

```tsx
import { createReducerModel } from '@lxsmnsyc/preact-scoped-model';

const Counter = createReducerModel((state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
});

// ...
<Counter.Provider>
  {/* ... */}
</Counter.Provider>

// ...
const [state, dispatch] = useValue(Counter);

dispatch({ type: 'INCREMENT' });
```

- `createPropsSelectorModel`: creates a scoped model whose state is its props.

```tsx
import { createPropsSelectorModel } from '@lxsmnsyc/preact-scoped-model';

const UserDetails = createPropsSelectorModel();

// ...
<UserDetails.Provider name={name} email={email}>
  {/* ... */}
</UserDetails.Provider>

// ...
const name = useSelector(UserDetails, (state) => state.name);
```

## See Also
- [Create Model](/packages/preact-scoped-model/docs/create-model.md)
- [Hook Factory](/packages/preact-scoped-model/docs/hook-factory.md)
- [Hooks](/packages/preact-scoped-model/docs/hooks/README.md)