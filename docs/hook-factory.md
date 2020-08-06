# Hook Factory

`react-scoped-model` provides a set of functions which produces React-based hooks based on the [out-of-the-box hooks](hooks/README.md). These functions accepts the same set of parameters as their hook counterparts.

## List of Hook Factories

- `createValue`: creates a hook based on [useValue](/docs/hooks/use-value.md).
```tsx
import { createValue } from '@lxsmnsyc/react-scoped-model';

const useTimer = createValue(Timer);

// ...
const { seconds } = useTimer();
```

- `createSelector`: creates a hook based on [useSelector](/docs/hooks/use-selector.md).

```tsx
import { createSelector } from '@lxsmnsyc/react-scoped-model';

const useTimerSeconds = createSelector(Timer, (state) => state.seconds);

// ...
const seconds = useTimerSeconds();
```

- `createSelectors`: creates a hook based on [useSelectors](/docs/hooks/use-selectors.md).
- `createAsyncSelector`: creates a hook based on [useAsyncSelector](/docs/hooks/use-async-selector.md).
- `createSuspenseSelector`: creates a hook based on [useSuspenseSelector](/docs/hooks/use-suspense-selector.md).
- `createSuspendedState`: creates a hook based on [useSuspendedState](/docs/hooks/use-suspended-state.md)`.

## See Also
- [Create Model](/docs/create-model.md)
- [Model Factory](/docs/model-factory.md)
- [Hooks](/docs/hooks/README.md)