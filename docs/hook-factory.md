# Hook Factory

`react-scoped-model` provides a set of functions which produces React-based hooks based on the [out-of-the-box hooks](hooks/README.md). These functions accepts the same set of parameters as their hook counterparts.

## List of Hook Factories

- `createValue`: creates a hook based on `useValue`.
```tsx
import { createValue } from '@lxsmnsyc/react-scoped-model';

const useTimer = createValue(Timer);

// ...
const { seconds } = useTimer();
```

- `createSelector`: creates a hook based on `useSelector`.

```tsx
import { createSelector } from '@lxsmnsyc/react-scoped-model';

const useTimerSeconds = createSelector(Timer, (state) => state.seconds);

// ...
const seconds = useTimerSeconds();
```

- `createSelectors`: creates a hook based on `useSelectors`.
- `createAsyncSelector`: creates a hook based on `useAsyncSelector`.
- `createSuspenseSelector`: creates a hook based on `useAsyncSelector`.
- `createSuspendedState`: creates a hook based on `useSuspendedState`.