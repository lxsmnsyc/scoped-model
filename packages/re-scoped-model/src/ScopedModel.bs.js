'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var React = require("react");
var Utils$ReScopedModel = require("./Utils.bs.js");
var Notifier$ReScopedModel = require("./Notifier.bs.js");
var Exceptions$ReScopedModel = require("./Exceptions.bs.js");

function Make(Facing) {
  var context = React.createContext(undefined);
  var make = context.Provider;
  var makeProps = function (value, children, param) {
    return {
            value: value,
            children: children
          };
  };
  make.displayName = Facing.displayName + ".Provider";
  var ContextProvider = {
    make: make,
    makeProps: makeProps
  };
  var ScopedModel$Make$ProcessorInner = function (Props) {
    var props = Props.props;
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), {
          RE_EXN_ID: Exceptions$ReScopedModel.MissingScopedModel
        });
    var model = Curry._1(Facing.call, props);
    Notifier$ReScopedModel.hydrate(notifier, model);
    React.useEffect((function () {
            Notifier$ReScopedModel.emit(notifier, model);
            
          }), [
          notifier,
          model
        ]);
    return null;
  };
  ScopedModel$Make$ProcessorInner.displayName = Facing.displayName + ".ProcessorInner";
  var ProcessorInner = {
    make: ScopedModel$Make$ProcessorInner
  };
  var make$1 = React.memo(ScopedModel$Make$ProcessorInner, (function (prev, next) {
          return Curry._2(Facing.shouldUpdate, prev.props, next.props);
        }));
  var makeProps$1 = function (props, param) {
    return {
            props: props
          };
  };
  make$1.displayName = Facing.displayName + ".Processor";
  var Processor = {
    make: make$1,
    makeProps: makeProps$1
  };
  var ScopedModel$Make$Provider = function (Props) {
    var props = Props.props;
    var children = Props.children;
    var notifier = Utils$ReScopedModel.Hooks.Constant.use(function (param) {
          return Notifier$ReScopedModel.make(undefined);
        });
    return React.createElement(make, makeProps(notifier, null, undefined), React.createElement(make$1, {
                    props: props
                  }), children);
  };
  ScopedModel$Make$Provider.displayName = Facing.displayName;
  var Provider = {
    make: ScopedModel$Make$Provider
  };
  var reference_displayName = Facing.displayName;
  var reference = {
    context: context,
    displayName: reference_displayName
  };
  return {
          context: context,
          ContextProvider: ContextProvider,
          ProcessorInner: ProcessorInner,
          Processor: Processor,
          Provider: Provider,
          reference: reference
        };
}

function useScopedModelContext(reference) {
  return Utils$ReScopedModel.Result.get(React.useContext(reference.context), {
              RE_EXN_ID: Exceptions$ReScopedModel.MissingScopedModel
            });
}

var Internals = {
  useScopedModelContext: useScopedModelContext
};

function useValueOnce(reference) {
  var notifier = useScopedModelContext(reference);
  return Notifier$ReScopedModel.value(notifier);
}

function useValue(reference, shouldUpdate) {
  var notifier = useScopedModelContext(reference);
  var subscription = Utils$ReScopedModel.Hooks.ConditionalMemo.use((function (param) {
          return {
                  read: (function (param) {
                      return Notifier$ReScopedModel.value(notifier);
                    }),
                  subscribe: (function (handler) {
                      return Notifier$ReScopedModel.subscribe(notifier, (function (param) {
                                    return Curry._1(handler, undefined);
                                  }));
                    }),
                  shouldUpdate: shouldUpdate
                };
        }), [
        notifier,
        shouldUpdate
      ], (function (param, param$1) {
          if (param[0] !== param$1[0]) {
            return true;
          } else {
            return param[1] !== param$1[1];
          }
        }));
  return Utils$ReScopedModel.Hooks.Subscription.use(subscription);
}

function useSelectorOnce(reference, selector) {
  var notifier = useScopedModelContext(reference);
  return Curry._1(selector, Notifier$ReScopedModel.value(notifier));
}

function useSelector(reference, selector, shouldUpdate) {
  var notifier = useScopedModelContext(reference);
  var subscription = Utils$ReScopedModel.Hooks.ConditionalMemo.use((function (param) {
          return {
                  read: (function (param) {
                      return Curry._1(selector, Notifier$ReScopedModel.value(notifier));
                    }),
                  subscribe: (function (handler) {
                      return Notifier$ReScopedModel.subscribe(notifier, (function (param) {
                                    return Curry._1(handler, undefined);
                                  }));
                    }),
                  shouldUpdate: shouldUpdate
                };
        }), [
        notifier,
        shouldUpdate,
        selector
      ], (function (param, param$1) {
          if (param[0] !== param$1[0] || param[1] !== param$1[1]) {
            return true;
          } else {
            return param[2] !== param$1[2];
          }
        }));
  return Utils$ReScopedModel.Hooks.Subscription.use(subscription);
}

function createValueOnce(reference) {
  return function (param) {
    return useValueOnce(reference);
  };
}

function createValue(reference, shouldUpdate) {
  return function (param) {
    return useValue(reference, shouldUpdate);
  };
}

function createSelectorOnce(reference, selector) {
  return function (param) {
    return useSelectorOnce(reference, selector);
  };
}

function createSelector(reference, selector, shouldUpdate) {
  return function (param) {
    return useSelector(reference, selector, shouldUpdate);
  };
}

function MakeNullary(Facing) {
  var call = Facing.call;
  var displayName = Facing.displayName;
  var context = React.createContext(undefined);
  var make = context.Provider;
  var makeProps = function (value, children, param) {
    return {
            value: value,
            children: children
          };
  };
  make.displayName = displayName + ".Provider";
  var ContextProvider = {
    make: make,
    makeProps: makeProps
  };
  var ScopedModel$Make$ProcessorInner = function (Props) {
    var props = Props.props;
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), {
          RE_EXN_ID: Exceptions$ReScopedModel.MissingScopedModel
        });
    var model = Curry._1(call, props);
    Notifier$ReScopedModel.hydrate(notifier, model);
    React.useEffect((function () {
            Notifier$ReScopedModel.emit(notifier, model);
            
          }), [
          notifier,
          model
        ]);
    return null;
  };
  ScopedModel$Make$ProcessorInner.displayName = displayName + ".ProcessorInner";
  var ProcessorInner = {
    make: ScopedModel$Make$ProcessorInner
  };
  var make$1 = React.memo(ScopedModel$Make$ProcessorInner, (function (prev, next) {
          return true;
        }));
  var makeProps$1 = function (props, param) {
    return {
            props: props
          };
  };
  make$1.displayName = displayName + ".Processor";
  var Processor = {
    make: make$1,
    makeProps: makeProps$1
  };
  var ScopedModel$Make$Provider = function (Props) {
    var props = Props.props;
    var children = Props.children;
    var notifier = Utils$ReScopedModel.Hooks.Constant.use(function (param) {
          return Notifier$ReScopedModel.make(undefined);
        });
    return React.createElement(make, makeProps(notifier, null, undefined), React.createElement(make$1, {
                    props: props
                  }), children);
  };
  ScopedModel$Make$Provider.displayName = displayName;
  var Provider = {
    make: ScopedModel$Make$Provider
  };
  var reference = {
    context: context,
    displayName: displayName
  };
  return {
          context: context,
          ContextProvider: ContextProvider,
          ProcessorInner: ProcessorInner,
          Processor: Processor,
          Provider: Provider,
          reference: reference
        };
}

function MakeState(Facing) {
  var displayName = Facing.displayName;
  var context = React.createContext(undefined);
  var make = context.Provider;
  var makeProps = function (value, children, param) {
    return {
            value: value,
            children: children
          };
  };
  make.displayName = displayName + ".Provider";
  var ContextProvider = {
    make: make,
    makeProps: makeProps
  };
  var ScopedModel$Make$ProcessorInner = function (Props) {
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), {
          RE_EXN_ID: Exceptions$ReScopedModel.MissingScopedModel
        });
    var model = React.useState(function () {
          return Curry._1(Facing.initialState, undefined);
        });
    Notifier$ReScopedModel.hydrate(notifier, model);
    React.useEffect((function () {
            Notifier$ReScopedModel.emit(notifier, model);
            
          }), [
          notifier,
          model
        ]);
    return null;
  };
  ScopedModel$Make$ProcessorInner.displayName = displayName + ".ProcessorInner";
  var ProcessorInner = {
    make: ScopedModel$Make$ProcessorInner
  };
  var make$1 = React.memo(ScopedModel$Make$ProcessorInner, (function (prev, next) {
          return true;
        }));
  var makeProps$1 = function (props, param) {
    return {
            props: props
          };
  };
  make$1.displayName = displayName + ".Processor";
  var Processor = {
    make: make$1,
    makeProps: makeProps$1
  };
  var ScopedModel$Make$Provider = function (Props) {
    var props = Props.props;
    var children = Props.children;
    var notifier = Utils$ReScopedModel.Hooks.Constant.use(function (param) {
          return Notifier$ReScopedModel.make(undefined);
        });
    return React.createElement(make, makeProps(notifier, null, undefined), React.createElement(make$1, {
                    props: props
                  }), children);
  };
  ScopedModel$Make$Provider.displayName = displayName;
  var Provider = {
    make: ScopedModel$Make$Provider
  };
  var reference = {
    context: context,
    displayName: displayName
  };
  return {
          context: context,
          ContextProvider: ContextProvider,
          ProcessorInner: ProcessorInner,
          Processor: Processor,
          Provider: Provider,
          reference: reference
        };
}

function MakeReducer(Facing) {
  var call = function (param) {
    return React.useReducer((function (param, param$1) {
                  return Curry._2(Facing.reducer, param, param$1);
                }), Curry._1(Facing.initialState, undefined));
  };
  var displayName = Facing.displayName;
  var context = React.createContext(undefined);
  var make = context.Provider;
  var makeProps = function (value, children, param) {
    return {
            value: value,
            children: children
          };
  };
  make.displayName = displayName + ".Provider";
  var ContextProvider = {
    make: make,
    makeProps: makeProps
  };
  var ScopedModel$Make$ProcessorInner = function (Props) {
    var props = Props.props;
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), {
          RE_EXN_ID: Exceptions$ReScopedModel.MissingScopedModel
        });
    var model = call(props);
    Notifier$ReScopedModel.hydrate(notifier, model);
    React.useEffect((function () {
            Notifier$ReScopedModel.emit(notifier, model);
            
          }), [
          notifier,
          model
        ]);
    return null;
  };
  ScopedModel$Make$ProcessorInner.displayName = displayName + ".ProcessorInner";
  var ProcessorInner = {
    make: ScopedModel$Make$ProcessorInner
  };
  var make$1 = React.memo(ScopedModel$Make$ProcessorInner, (function (prev, next) {
          return true;
        }));
  var makeProps$1 = function (props, param) {
    return {
            props: props
          };
  };
  make$1.displayName = displayName + ".Processor";
  var Processor = {
    make: make$1,
    makeProps: makeProps$1
  };
  var ScopedModel$Make$Provider = function (Props) {
    var props = Props.props;
    var children = Props.children;
    var notifier = Utils$ReScopedModel.Hooks.Constant.use(function (param) {
          return Notifier$ReScopedModel.make(undefined);
        });
    return React.createElement(make, makeProps(notifier, null, undefined), React.createElement(make$1, {
                    props: props
                  }), children);
  };
  ScopedModel$Make$Provider.displayName = displayName;
  var Provider = {
    make: ScopedModel$Make$Provider
  };
  var reference = {
    context: context,
    displayName: displayName
  };
  return {
          context: context,
          ContextProvider: ContextProvider,
          ProcessorInner: ProcessorInner,
          Processor: Processor,
          Provider: Provider,
          reference: reference
        };
}

function MakePropSelector(Facing) {
  var shouldUpdate = Facing.shouldUpdate;
  var displayName = Facing.displayName;
  var context = React.createContext(undefined);
  var make = context.Provider;
  var makeProps = function (value, children, param) {
    return {
            value: value,
            children: children
          };
  };
  make.displayName = displayName + ".Provider";
  var ContextProvider = {
    make: make,
    makeProps: makeProps
  };
  var ScopedModel$Make$ProcessorInner = function (Props) {
    var props = Props.props;
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), {
          RE_EXN_ID: Exceptions$ReScopedModel.MissingScopedModel
        });
    Notifier$ReScopedModel.hydrate(notifier, props);
    React.useEffect((function () {
            Notifier$ReScopedModel.emit(notifier, props);
            
          }), [
          notifier,
          props
        ]);
    return null;
  };
  ScopedModel$Make$ProcessorInner.displayName = displayName + ".ProcessorInner";
  var ProcessorInner = {
    make: ScopedModel$Make$ProcessorInner
  };
  var make$1 = React.memo(ScopedModel$Make$ProcessorInner, (function (prev, next) {
          return Curry._2(shouldUpdate, prev.props, next.props);
        }));
  var makeProps$1 = function (props, param) {
    return {
            props: props
          };
  };
  make$1.displayName = displayName + ".Processor";
  var Processor = {
    make: make$1,
    makeProps: makeProps$1
  };
  var ScopedModel$Make$Provider = function (Props) {
    var props = Props.props;
    var children = Props.children;
    var notifier = Utils$ReScopedModel.Hooks.Constant.use(function (param) {
          return Notifier$ReScopedModel.make(undefined);
        });
    return React.createElement(make, makeProps(notifier, null, undefined), React.createElement(make$1, {
                    props: props
                  }), children);
  };
  ScopedModel$Make$Provider.displayName = displayName;
  var Provider = {
    make: ScopedModel$Make$Provider
  };
  var reference = {
    context: context,
    displayName: displayName
  };
  return {
          context: context,
          ContextProvider: ContextProvider,
          ProcessorInner: ProcessorInner,
          Processor: Processor,
          Provider: Provider,
          reference: reference
        };
}

exports.Make = Make;
exports.Internals = Internals;
exports.useValueOnce = useValueOnce;
exports.useValue = useValue;
exports.useSelectorOnce = useSelectorOnce;
exports.useSelector = useSelector;
exports.createValueOnce = createValueOnce;
exports.createValue = createValue;
exports.createSelectorOnce = createSelectorOnce;
exports.createSelector = createSelector;
exports.MakeNullary = MakeNullary;
exports.MakeState = MakeState;
exports.MakeReducer = MakeReducer;
exports.MakePropSelector = MakePropSelector;
/* react Not a pure module */
