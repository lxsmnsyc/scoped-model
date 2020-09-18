

import * as Curry from "bs-platform/lib/es6/curry.js";
import * as React from "react";
import * as Caml_obj from "bs-platform/lib/es6/caml_obj.js";
import * as Utils$ReScopedModel from "./Utils.bs.js";
import * as Notifier$ReScopedModel from "./Notifier.bs.js";
import * as Exceptions$ReScopedModel from "./Exceptions.bs.js";

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
    Notifier$ReScopedModel.sync(notifier, model);
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
    var notifier = Utils$ReScopedModel.Hooks.useConstant(function (param) {
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
  return Utils$ReScopedModel.Result.get(notifier.currentValue, {
              RE_EXN_ID: Exceptions$ReScopedModel.DesyncScopedModel
            });
}

function useValue(reference, shouldUpdate) {
  var memo = shouldUpdate !== undefined ? shouldUpdate : $$default;
  var notifier = useScopedModelContext(reference);
  var match = React.useState(function () {
        return Utils$ReScopedModel.Result.get(notifier.currentValue, {
                    RE_EXN_ID: Exceptions$ReScopedModel.DesyncScopedModel
                  });
      });
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
        }), [
        notifier,
        memo
      ]);
  return match[0];
}

function useSelectorOnce(reference, selector) {
  var notifier = useScopedModelContext(reference);
  return Curry._1(selector, Utils$ReScopedModel.Result.get(notifier.currentValue, {
                  RE_EXN_ID: Exceptions$ReScopedModel.DesyncScopedModel
                }));
}

function useSelector(reference, selector, shouldUpdate) {
  var memo = shouldUpdate !== undefined ? shouldUpdate : $$default;
  var notifier = useScopedModelContext(reference);
  var match = React.useState(function () {
        return Curry._1(selector, Utils$ReScopedModel.Result.get(notifier.currentValue, {
                        RE_EXN_ID: Exceptions$ReScopedModel.DesyncScopedModel
                      }));
      });
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
        }), [
        notifier,
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
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), {
          RE_EXN_ID: Exceptions$ReScopedModel.MissingScopedModel
        });
    var model = Curry._1(call, props);
    Notifier$ReScopedModel.sync(notifier, model);
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
    var notifier = Utils$ReScopedModel.Hooks.useConstant(function (param) {
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
    Props.props;
    var notifier = Utils$ReScopedModel.Result.get(React.useContext(context), {
          RE_EXN_ID: Exceptions$ReScopedModel.MissingScopedModel
        });
    var model = React.useState(function () {
          return Curry._1(Facing.initialState, undefined);
        });
    Notifier$ReScopedModel.sync(notifier, model);
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
    var notifier = Utils$ReScopedModel.Hooks.useConstant(function (param) {
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
    Notifier$ReScopedModel.sync(notifier, model);
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
    var notifier = Utils$ReScopedModel.Hooks.useConstant(function (param) {
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
    Notifier$ReScopedModel.sync(notifier, props);
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
    var notifier = Utils$ReScopedModel.Hooks.useConstant(function (param) {
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

export {
  Make ,
  Internals ,
  ShouldUpdate ,
  useValueOnce ,
  useValue ,
  useSelectorOnce ,
  useSelector ,
  createValueOnce ,
  createValue ,
  createSelectorOnce ,
  createSelector ,
  MakeNullary ,
  MakeState ,
  MakeReducer ,
  MakePropSelector ,
  
}
/* react Not a pure module */
