import React, {
  ReactNode,
  useState,
  useEffect,
} from 'react';

export interface DelayedProps {
  mounted: boolean;
  mountDelay?: number;
  onMount?: () => void;
  unmountDelay?: number;
  onUnmount?: () => void;
  children: ReactNode;
}

export default function Delayed(
  {
    mounted, mountDelay, unmountDelay, children, onMount, onUnmount,
  }: DelayedProps,
): JSX.Element {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    if (mounted) {
      const mountCallback = () => {
        if (onMount) {
          onMount();
        }
        setMount(true);
      };
      if (mountDelay) {
        const timeout = setTimeout(mountCallback, mountDelay);
        return () => {
          clearTimeout(timeout);
        };
      }
      mountCallback();
    } else {
      const unmountCallback = () => {
        if (onUnmount) {
          onUnmount();
        }
        setMount(false);
      };
      if (unmountDelay) {
        const timeout = setTimeout(unmountCallback, unmountDelay);
        return () => {
          clearTimeout(timeout);
        };
      }
      unmountCallback();
    }
    return undefined;
  }, [mounted, mountDelay, unmountDelay, onMount, onUnmount]);

  return (
    <>{ mount && children }</>
  );
}
