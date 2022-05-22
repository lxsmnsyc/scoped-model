

import * as Curry from "bs-platform/lib/es6/curry.js";
import * as React from "react";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";
import * as Caml_exceptions from "bs-platform/lib/es6/caml_exceptions.js";

function get(value, err) {
  if (value !== undefined) {
    return Caml_option.valFromOption(value);
  }
  throw err;
}

var Result = {
  get: get
};

function defaultCompare(a, b) {
  return a !== b;
}

function use(shouldUpdate, a, b) {
  if (shouldUpdate !== undefined) {
    return shouldUpdate(a, b);
  } else {
    return defaultCompare(a, b);
  }
}

var Compare = {
  defaultCompare: defaultCompare,
  use: use
};

function use$1(supplier) {
  var ref = React.useRef(undefined);
  if (ref.current === undefined) {
    ref.current = Caml_option.some(Curry._1(supplier, undefined));
  }
  return ref;
}

var LazyRef = {
  use: use$1
};

var FallthroughLazyRef = Caml_exceptions.create("Utils-ReScopedModel.Hooks.Constant.FallthroughLazyRef");

function use$2(supplier) {
  return get(use$1(supplier).current, {
              RE_EXN_ID: FallthroughLazyRef
            });
}

var Constant = {
  FallthroughLazyRef: FallthroughLazyRef,
  use: use$2
};

function use$3(callback) {
  return use$2(function (param) {
              return callback;
            });
}

var ConstantCallback = {
  use: use$3
};

function use$4() {
  var match = React.useState(function () {
        return /* [] */0;
      });
  var dispatch = match[1];
  return use$3(function (param) {
              return Curry._1(dispatch, (function (param) {
                            return /* [] */0;
                          }));
            });
}

var ForceUpdate = {
  use: use$4
};

function use$5(supplier, dependency, shouldUpdate) {
  var value = use$1(supplier);
  var prevDeps = React.useRef(dependency);
  if (use(shouldUpdate, prevDeps.current, dependency)) {
    value.current = Caml_option.some(Curry._1(supplier, undefined));
    prevDeps.current = dependency;
  }
  return value;
}

var FreshLazyRef = {
  use: use$5
};

var FallthroughConditionalMemo = Caml_exceptions.create("Utils-ReScopedModel.Hooks.ConditionalMemo.FallthroughConditionalMemo");

function use$6(supplier, dependency, shouldUpdate) {
  return get(use$5(supplier, dependency, shouldUpdate).current, {
              RE_EXN_ID: FallthroughConditionalMemo
            });
}

var ConditionalMemo = {
  FallthroughConditionalMemo: FallthroughConditionalMemo,
  use: use$6
};

var Read = {};

var Handler = {};

var Cleanup = {};

var Subscribe = {
  Handler: Handler,
  Cleanup: Cleanup
};

function use$7(param) {
  var shouldUpdate = param.shouldUpdate;
  var subscribe = param.subscribe;
  var read = param.read;
  var match = React.useState(function () {
        return {
                read: read,
                subscribe: subscribe,
                shouldUpdate: shouldUpdate,
                value: Curry._1(read, undefined)
              };
      });
  var setState = match[1];
  var state = match[0];
  var currentValue = state.value;
  if (read !== state.read || subscribe !== state.subscribe || shouldUpdate !== state.shouldUpdate) {
    currentValue = Curry._1(read, undefined);
    Curry._1(setState, (function (param) {
            return {
                    read: read,
                    subscribe: subscribe,
                    shouldUpdate: shouldUpdate,
                    value: Curry._1(read, undefined)
                  };
          }));
  }
  React.useEffect((function () {
          var mounted = {
            contents: true
          };
          var handleChange = function (param) {
            if (!mounted.contents) {
              return ;
            }
            var next = Curry._1(read, undefined);
            return Curry._1(setState, (function (prev) {
                          if (read === state.read && subscribe === state.subscribe && shouldUpdate === state.shouldUpdate && use(shouldUpdate, prev.value, next)) {
                            return {
                                    read: prev.read,
                                    subscribe: prev.subscribe,
                                    shouldUpdate: prev.shouldUpdate,
                                    value: next
                                  };
                          } else {
                            return prev;
                          }
                        }));
          };
          var unsubscribe = Curry._1(subscribe, handleChange);
          handleChange(undefined);
          return (function (param) {
                    mounted.contents = false;
                    if (unsubscribe !== undefined) {
                      return Curry._1(unsubscribe, undefined);
                    }
                    
                  });
        }), [
        read,
        subscribe,
        shouldUpdate
      ]);
  return currentValue;
}

var Subscription = {
  Read: Read,
  Subscribe: Subscribe,
  use: use$7
};

var Hooks = {
  LazyRef: LazyRef,
  Constant: Constant,
  ConstantCallback: ConstantCallback,
  ForceUpdate: ForceUpdate,
  FreshLazyRef: FreshLazyRef,
  ConditionalMemo: ConditionalMemo,
  Subscription: Subscription
};

export {
  Result ,
  Compare ,
  Hooks ,
  
}
/* react Not a pure module */
