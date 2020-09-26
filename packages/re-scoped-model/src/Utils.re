module Result = {
  let get = (value: option('a), err: exn) => {
    switch (value) {
      | Some(actualValue) => actualValue;
      | None => raise(err);      
    }
  }
};

module Hooks = {
  module Constant = {
    let use = (supplier: unit => 'a): 'a => {
      let ref = React.useRef(None);

      switch (ref.current) {
        | Some(value) => value;
        | None => {
          let value = supplier();
          ref.current = Some(value);
          value;
        };
      }
    };
  };

  module ConstantCallback = {
    let use = (cb: 'a => 'b): ('a => 'b) => {
      Constant.use(() => cb);
    };
  };

  module ForceUpdate = {
    type t = unit => unit;

    let use = (): t => {
      let (_, setState) = React.useState(() => false);

      ConstantCallback.use(() => {
        setState((current) => !current);
      });
    };
  };

  module NativeMemo = {
    let use = (supplier: unit => 'a, dependency: 'b, compare: ('b, 'b) => bool) => {
      let deps = React.useRef(dependency);
      let result = React.useRef(None)

      if (compare(deps.current, dependency)) {
        result.current = Some(supplier());
        deps.current = dependency;
      }

      switch (result.current) {
        | Some(value) => value;
        | None => {
          let value = supplier();
          result.current = Some(value);
          value;
        };
      }
    };
  };

  module FreshState = {
    type t('a) = {
      mutable current: 'a,
    };

    module Dispatch = {
      module Action = {
        type t('a) = 'a => 'a;
      };

      type t('a) = Action.t('a) => unit;
    };

    let use = (initial: unit => 'a, dependencies: 'b, compare: ('b, 'b) => bool): ('a, Dispatch.t('a)) => {
      let state = NativeMemo.use(() => {
        current: initial(),
      }, dependencies, compare);

      let alive = React.useRef(false);

      React.useEffect0(() => {
        alive.current = true;
        Some(() => {
          alive.current = false;
        });
      });

      let forceUpdate = ForceUpdate.use();

      let setState: Dispatch.t('a) = React.useCallback1(
        (action: Dispatch.Action.t('a)) => {
          let oldState = state.current;
          let newState = action(oldState);

          if (oldState !== newState) {
            state.current = newState;
            forceUpdate();
          }
        },
        [| state |],
      );

      (state.current, setState);
    };
  };

  let useConstant = Constant.use;
  let useForceUpdate = ForceUpdate.use;
  let useFreshState = FreshState.use;
};