module Result = {
  let get = (. value: option('a), err: exn) => {
    switch (value) {
      | Some(actualValue) => actualValue;
      | None => raise(err);      
    }
  }
};

module Compare = {
  type t('a) = (. 'a, 'a) => bool;

  let defaultCompare: t('a) = (. a, b) => a !== b;

  let use = (. shouldUpdate: option(t('a)), a: 'a, b: 'a): bool => {
    switch (shouldUpdate) {
      | Some(cmp) => cmp(. a, b)
      | None => defaultCompare(. a, b)
    }
  };
};

module Hooks = {
  module LazyRef = {
    let use = (. supplier: unit => 'a) => {
      let ref = React.useRef(None);

      if (ref.current == None) {
        ref.current = Some(supplier());
      }

      ref;
    };
  };

  module Constant = {
    exception FallthroughLazyRef;

    let use = (. supplier: unit => 'a) => {
      Result.get(
        .
        LazyRef.use(. supplier).current,
        FallthroughLazyRef,
      );
    }
  };

  module ConstantCallback = {
    let use = (. callback: 'a => 'b) => {
      Constant.use(. () => callback);
    };
  };

  module ForceUpdate = {
    let use = (.) => {
      let (_, dispatch) = React.useState(() => []);

      ConstantCallback.use(. () => {
        dispatch((_) => []);
      });
    };
  };

  module FreshLazyRef = {
    let use = (
      . 
      supplier: unit => 'a,
      dependency: 'b,
      shouldUpdate: option(Compare.t('b))
    ): React.ref(option('a)) => {
      let value = LazyRef.use(. supplier);
      let prevDeps = React.useRef(dependency);

      if (Compare.use(. shouldUpdate, prevDeps.current, dependency)) {
        value.current = Some(supplier());
        prevDeps.current = dependency;
      }

      value;
    };
  };

  module ConditionalMemo = {
    exception FallthroughConditionalMemo;

    let use = (
      . 
      supplier: unit => 'a,
      dependency: 'b,
      shouldUpdate: option(Compare.t('b))
    ): 'a => {
      Result.get(
        .
        FreshLazyRef.use(. supplier, dependency, shouldUpdate).current,
        FallthroughConditionalMemo,
      );
    };
  };

  module Subscription = {
    module Read = {
      type t('a) = unit => 'a;
    };
    module Subscribe = {
      module Handler = {
        type t = unit => unit;
      };
      module Cleanup = {
        type t = option(unit => unit);
      };

      type t = Handler.t => Cleanup.t;
    };

    type t('a) = {
      read: Read.t('a),
      subscribe: Subscribe.t,
      shouldUpdate: option(Compare.t('a)),
    };

    type internal('a) = {
      read: Read.t('a),
      subscribe: Subscribe.t,
      shouldUpdate: option(Compare.t('a)),
      value: 'a,
    };

    let use = (. { read, subscribe, shouldUpdate }: t('a)): 'a => {
      let (state, setState) = React.useState(
        () => {
          read,
          subscribe,
          shouldUpdate,
          value: read(),
        }
      );

      let currentValue = ref(state.value);

      if (
        read !== state.read
        || subscribe !== state.subscribe
        || shouldUpdate !== state.shouldUpdate
      ) {
        currentValue := read();

        setState((_) => {
          read,
          subscribe,
          shouldUpdate,
          value: read(),
        });
      }

      React.useEffect3(() => {
        let mounted = ref(true);

        let handleChange = () => {
          if (mounted^) {
            let next = read();

            setState((prev) => {
              if (
                read === state.read
                && subscribe === state.subscribe
                && shouldUpdate === state.shouldUpdate
                && Compare.use(. shouldUpdate, prev.value, next)
              ) {
                {
                  ...prev,
                  value: next
                };
              } else {
                prev;
              }
            });
          }
        };

        let unsubscribe = subscribe(handleChange);

        handleChange();

        Some(() => {
          mounted := false;

          switch (unsubscribe) {
            | Some(cb) => cb();
            | None => ();
          }
        });
      }, (read, subscribe, shouldUpdate));

      currentValue^;
    };
  };
};