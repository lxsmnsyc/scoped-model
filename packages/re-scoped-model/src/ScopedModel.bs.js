'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var React = require("react");
var Caml_obj = require("bs-platform/lib/js/caml_obj.js");
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
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), Exceptions$ReScopedModel.MissingScopedModel);
    var model = Curry._1(Facing.call, props);
    Notifier$ReScopedModel.sync(notifier, model);
    React.useEffect((function () {
            Notifier$ReScopedModel.emit(notifier, model);
            
          }), /* tuple */[
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
    var notifier = Curry._1(Utils$ReScopedModel.Hooks.Constant.use, (function (param) {
            return Notifier$ReScopedModel.make(undefined);
          }));
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
  return Utils$ReScopedModel.Result.get(React.useContext(reference.context), Exceptions$ReScopedModel.MissingScopedModel);
}

var Internals = {
  useScopedModelContext: useScopedModelContext
};

var $$default = Caml_obj.caml_notequal;

function useDefault(test) {
  if (test !== undefined) {
    return test;
  } else {
    return $$default;
  }
}

var ShouldUpdate = {
  $$default: $$default,
  useDefault: useDefault
};

function useValueOnce(reference) {
  var notifier = useScopedModelContext(reference);
  return Utils$ReScopedModel.Result.get(notifier.currentValue, Exceptions$ReScopedModel.DesyncScopedModel);
}

function useValue(reference, shouldUpdate) {
  var memo = shouldUpdate !== undefined ? shouldUpdate : $$default;
  var notifier = useScopedModelContext(reference);
  var match = Curry._3(Utils$ReScopedModel.Hooks.FreshState.use, (function (param) {
          return Utils$ReScopedModel.Result.get(notifier.currentValue, Exceptions$ReScopedModel.DesyncScopedModel);
        }), reference, (function (oldRef, newRef) {
          return oldRef !== newRef;
        }));
  var setState = match[1];
  React.useEffect((function () {
          var cb = function (value) {
            return Curry._1(setState, (function (prev) {
                          if (Curry._2(memo, prev, value)) {
                            return value;
                          } else {
                            return prev;
                          }
                        }));
          };
          Notifier$ReScopedModel.on(notifier, cb);
          return (function (param) {
                    return Notifier$ReScopedModel.off(notifier, cb);
                  });
        }), /* tuple */[
        notifier,
        setState,
        memo
      ]);
  return match[0];
}

function useSelectorOnce(reference, selector) {
  var notifier = useScopedModelContext(reference);
  return Curry._1(selector, Utils$ReScopedModel.Result.get(notifier.currentValue, Exceptions$ReScopedModel.DesyncScopedModel));
}

function useSelector(reference, selector, shouldUpdate) {
  var memo = shouldUpdate !== undefined ? shouldUpdate : $$default;
  var notifier = useScopedModelContext(reference);
  var match = Curry._3(Utils$ReScopedModel.Hooks.FreshState.use, (function (param) {
          return Curry._1(selector, Utils$ReScopedModel.Result.get(notifier.currentValue, Exceptions$ReScopedModel.DesyncScopedModel));
        }), /* tuple */[
        reference,
        selector
      ], (function (prev, next) {
          if (prev[0] !== next[0]) {
            return prev[1] !== next[1];
          } else {
            return false;
          }
        }));
  var setState = match[1];
  React.useEffect((function () {
          var cb = function (value) {
            return Curry._1(setState, (function (prev) {
                          var next = Curry._1(selector, value);
                          if (Curry._2(memo, prev, next)) {
                            return next;
                          } else {
                            return prev;
                          }
                        }));
          };
          Notifier$ReScopedModel.on(notifier, cb);
          return (function (param) {
                    return Notifier$ReScopedModel.off(notifier, cb);
                  });
        }), /* tuple */[
        notifier,
        selector,
        setState,
        memo
      ]);
  return match[0];
}

function createValueOnce(reference, param) {
  return useValueOnce(reference);
}

function createValue(reference, shouldUpdate, param) {
  return useValue(reference, shouldUpdate);
}

function createSelectorOnce(reference, selector, param) {
  return useSelectorOnce(reference, selector);
}

function createSelector(reference, selector, shouldUpdate, param) {
  return useSelector(reference, selector, shouldUpdate);
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
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), Exceptions$ReScopedModel.MissingScopedModel);
    var model = Curry._1(call, props);
    Notifier$ReScopedModel.sync(notifier, model);
    React.useEffect((function () {
            Notifier$ReScopedModel.emit(notifier, model);
            
          }), /* tuple */[
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
          next.props;
          prev.props;
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
    var notifier = Curry._1(Utils$ReScopedModel.Hooks.Constant.use, (function (param) {
            return Notifier$ReScopedModel.make(undefined);
          }));
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
    Props.props;
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), Exceptions$ReScopedModel.MissingScopedModel);
    var model = React.useState((function () {
            return Curry._1(Facing.initialState, undefined);
          }));
    Notifier$ReScopedModel.sync(notifier, model);
    React.useEffect((function () {
            Notifier$ReScopedModel.emit(notifier, model);
            
          }), /* tuple */[
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
          next.props;
          prev.props;
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
    var notifier = Curry._1(Utils$ReScopedModel.Hooks.Constant.use, (function (param) {
            return Notifier$ReScopedModel.make(undefined);
          }));
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
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), Exceptions$ReScopedModel.MissingScopedModel);
    var model = call(props);
    Notifier$ReScopedModel.sync(notifier, model);
    React.useEffect((function () {
            Notifier$ReScopedModel.emit(notifier, model);
            
          }), /* tuple */[
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
          next.props;
          prev.props;
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
    var notifier = Curry._1(Utils$ReScopedModel.Hooks.Constant.use, (function (param) {
            return Notifier$ReScopedModel.make(undefined);
          }));
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
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), Exceptions$ReScopedModel.MissingScopedModel);
    Notifier$ReScopedModel.sync(notifier, props);
    React.useEffect((function () {
            Notifier$ReScopedModel.emit(notifier, props);
            
          }), /* tuple */[
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
    var notifier = Curry._1(Utils$ReScopedModel.Hooks.Constant.use, (function (param) {
            return Notifier$ReScopedModel.make(undefined);
          }));
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
exports.ShouldUpdate = ShouldUpdate;
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
