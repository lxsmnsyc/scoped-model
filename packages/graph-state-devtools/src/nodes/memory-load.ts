import { createGraphNode, GraphNodeDebugData } from 'graph-state';
import readMemory from '../utils/read-memory';
import shouldRefresh from './should-refresh';
import refreshInterval from './refresh-interval';
import shouldRefreshOnFocus from './should-refresh-on-focus';

const memoryLoad = createGraphNode<Promise<GraphNodeDebugData[]>>({
  get: ({ get, subscription, mutateSelf }) => {
    const load = () => {
      mutateSelf(readMemory());
    };

    const refreshFlag = get(shouldRefresh);

    if (refreshFlag) {
      const refreshMs = get(refreshInterval);

      subscription(() => {
        const interval = setInterval(load, refreshMs);

        return () => {
          clearInterval(interval);
        };
      });
    }

    const focusFlag = get(shouldRefreshOnFocus);

    if (focusFlag) {
      subscription(() => {
        window.addEventListener('focus', load, false);

        return () => {
          window.removeEventListener('focus', load, false);
        };
      });
    }

    return readMemory();
  },
});

export default memoryLoad;
