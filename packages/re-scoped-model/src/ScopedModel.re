open Utils;

/**
 * Type for the scoped model reference, used for hooks
 */
type t('a) = {
  context: React.Context.t(option(Notifier.t('a))),
  displayName: string,
};

/**
 * Base module interface for models
 */
module type Interface = {
  type props;

  type t;

  let call: props => t;

  let shouldUpdate: props => props => bool;

  let displayName: string;
};

module Make = (Facing: Interface) => {
  /**
   * Injects the state store in the component tree
   */
  let context: React.Context.t(option(Notifier.t(Facing.t)))
    = React.createContext(None);

  module ContextProvider = {
    let make = React.Context.provider(context);

    let makeProps = (~value, ~children, ()) => {
      "value": value,
      "children": children,
    };

    React.setDisplayName(make, Facing.displayName ++ ".Provider");
  };

  /**
   * Processes the model logic
   */
  module ProcessorInner = {
    [@react.component]
    let make = (~props) => {
      /**
       * Consume notifier provided by context,
       * throw an error if there's notifier consumed.
       */
      let notifier = Result.get(
        . 
        React.useContext(context),
        Exceptions.MissingScopedModel,
      );

      /**
       * Run model hook
       */
      let model = Facing.call(props);

      /**
       * Synchronize notifier state
       */
      Notifier.hydrate(. notifier, model);

      /**
       * After React 16.13, components
       * can no longer synchronously call dispatch
       * actions from useReducer and useState.
       * We have to defer such calls to the useEffect
       */
      React.useEffect2(() => {
        Notifier.emit(. notifier, model);
        None;
      }, (notifier, model));

      ReasonReact.null;
    };

    /**
     * Set dispaly name for the component
     */
    React.setDisplayName(make, Facing.displayName ++ ".ProcessorInner");
  };

  /**
   * Memoizes the processor
   */
  module Processor = {
    let make = React.memoCustomCompareProps(ProcessorInner.make, (prev, next) => {
      Facing.shouldUpdate(prev##props, next##props);
    });

    let makeProps = (~props, ()) => {
      "props": props,
    };

    /**
     * Set dispaly name for the component
     */
    React.setDisplayName(make, Facing.displayName ++ ".Processor");
  };

  /**
   * Creator of notifier instance which lives
   * through out the component lifecycle.
   */
  module Provider = {
    [@react.component]
    let make = (~props, ~children) => {
      /**
       * Create a notifier instance
       */
      let notifier = Hooks.Constant.use(. () => Some(Notifier.make()));

      <ContextProvider value=notifier>
        <Processor props=props />
        children
      </ContextProvider>
    };

    /**
     * Set dispaly name for the component
     */
    React.setDisplayName(make, Facing.displayName);
  };


  /**
   * Create a scoped model reference
   */
  let reference: t(Facing.t) = {
    context,
    displayName: Facing.displayName,
  };
};

module Internals = {
  let useScopedModelContext = (. reference: t('a)) => {
    Result.get(
      .
      React.useContext(reference.context),
      Exceptions.MissingScopedModel,
    );
  };
};

/**
 * Reads the model's current state once.
 */
let useValueOnce = (. reference: t('a)): 'a => {
  let notifier = Internals.useScopedModelContext(. reference);

  Notifier.value(. notifier);
};

/**
 * Reads the model's current state. Conditionally re-renders
 * the component if the state changes by comparison.
 */
let useValue = (. reference: t('a), shouldUpdate: option(Utils.Compare.t('a))): 'a => {
  let notifier = Internals.useScopedModelContext(. reference);

  let subscription = Utils.Hooks.ConditionalMemo.use(
    .
    (): Utils.Hooks.Subscription.t('a) => {
      read: () => Notifier.value(. notifier),
      subscribe: (handler) => Some(Notifier.subscribe(. notifier, (_) => {
        handler();
      })),
      shouldUpdate,
    },
    (notifier, shouldUpdate),
    Some((. (prevN, prevSU), (nextN, nextSU)) => {
      prevN !== nextN
      || prevSU !== nextSU
    }),
  );

  Utils.Hooks.Subscription.use(. subscription);
};

/**
 * Reads the model's current state once and transforms it into a
 * new value.
 */
let useSelectorOnce = (. reference: t('a), selector: 'a => 'b): 'b => {
  let notifier = Internals.useScopedModelContext(. reference);

  selector(Notifier.value(. notifier));
};

/**
 * Reads the model's current state and transforms it into a
 * new value. Reactively receives the state updates, transforms
 * the new state and conditionally re-renders the component if
 * the transformed value changes by comparison.
 */
let useSelector = (
  .
  reference: t('a),
  selector: 'a => 'b,
  shouldUpdate: option(Utils.Compare.t('b))
): 'b => {
  let notifier = Internals.useScopedModelContext(. reference);

  let subscription = Utils.Hooks.ConditionalMemo.use(
    .
    (): Utils.Hooks.Subscription.t('b) => {
      read: () => selector(Notifier.value(. notifier)),
      subscribe: (handler) => Some(Notifier.subscribe(. notifier, (_) => {
        handler();
      })),
      shouldUpdate,
    },
    (notifier, shouldUpdate, selector),
    Some((. (prevN, prevSU, prevS), (nextN, nextSU, nextS)) => {
      prevN !== nextN
      || prevSU !== nextSU
      || prevS !== nextS
    }),
  );

  Utils.Hooks.Subscription.use(. subscription);
};

/**
 * Creates a useValueOnce hook.
 */
let createValueOnce = (. reference: t('a)): (unit => 'a) => {
  (): 'a => {
    useValueOnce(. reference);
  };
};

/**
 * Creates a useValue hook.
 */
let createValue = (
  .
  reference: t('a), 
  shouldUpdate: option(Utils.Compare.t('a))
): (unit => 'a) => {
  (): 'a => {
    useValue(. reference, shouldUpdate);
  };
};

/**
 * Creates a useSelectorOnce hook.
 */
let createSelectorOnce = (
  .
  reference: t('a),
  selector: 'a => 'b
): (unit => 'b) => {
  (): 'b => {
    useSelectorOnce(. reference, selector);
  };
};

/**
 * Creates a useSelector hook.
 */
let createSelector = (
  .
  reference: t('a),
  selector: 'a => 'b,
  shouldUpdate: option(Utils.Compare.t('b))
): (unit => 'b) => {
  (): 'b => {
    useSelector(. reference, selector, shouldUpdate);
  };
};

/**
 * Creates a model module that doesn't receive a props value,
 * stabilizing the model processor even if the provider's children
 * constantly changes.
 */
module type NullaryInterface = {
  type t;

  let call: unit => t;

  let displayName: string;
};

module MakeNullary = (Facing: NullaryInterface) => Make({
  include Facing;

  type props = unit;

  let shouldUpdate = (_, _) => true;
});

/**
 * Creates a nullary model based on the React.useState hook.
 */
module type StateInterface = {
  type state;

  let initialState: unit => state;

  let displayName: string;
};

module MakeState = (Facing: StateInterface) => MakeNullary({
  type t = (Facing.state, (Facing.state => Facing.state) => unit);

  let call = () => React.useState(Facing.initialState);

  let displayName = Facing.displayName;
});

/**
 * Creates a nullary model based on the React.useReducer hook.
 */
module type ReducerInterface = {
  type state;

  type action;

  let initialState: unit => state;

  let reducer: (state, action) => state;

  let displayName: string;
};

module MakeReducer = (Facing: ReducerInterface) => MakeNullary({
  type t = (Facing.state, Facing.action => unit);

  let call = () => React.useReducer(Facing.reducer, Facing.initialState());

  let displayName = Facing.displayName;
});

module type PropSelectorInterface = {
  type props;

  let shouldUpdate: (props, props) => bool;

  let displayName: string;
};

module MakePropSelector = (Facing: PropSelectorInterface) => Make({
  type t = Facing.props;
  type props = Facing.props;

  let call = (props) => props;

  let shouldUpdate = Facing.shouldUpdate;
  let displayName = Facing.displayName;
});
