

import * as Curry from "bs-platform/lib/es6/curry.js";
import * as React from "react";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";

function get(value, err) {
  if (value !== undefined) {
    return Caml_option.valFromOption(value);
  }
  throw err;
}

var Result = {
  get: get
};

function use(supplier) {
  var ref = React.useRef(undefined);
  var value = ref.current;
  if (value !== undefined) {
    return Caml_option.valFromOption(value);
  }
  var value$1 = Curry._1(supplier, undefined);
  ref.current = Caml_option.some(value$1);
  return value$1;
}

var Constant = {
  use: use
};

function use$1(cb) {
  return use(function (param) {
              return cb;
            });
}

var ConstantCallback = {
  use: use$1
};

function use$2(param) {
  var match = React.useState(function () {
        return false;
      });
  var setState = match[1];
  var cb = function (param) {
    return Curry._1(setState, (function (current) {
                  return !current;
                }));
  };
  return use(function (param) {
              return cb;
            });
}

var ForceUpdate = {
  use: use$2
};

function use$3(supplier, dependency, compare) {
  var deps = React.useRef(dependency);
  var result = React.useRef(undefined);
  if (Curry._2(compare, deps.current, dependency)) {
    result.current = Caml_option.some(Curry._1(supplier, undefined));
    deps.current = dependency;
  }
  var value = result.current;
  if (value !== undefined) {
    return Caml_option.valFromOption(value);
  }
  var value$1 = Curry._1(supplier, undefined);
  result.current = Caml_option.some(value$1);
  return value$1;
}

var NativeMemo = {
  use: use$3
};

var Action = {};

var Dispatch = {
  Action: Action
};

function use$4(initial, dependencies, compare) {
  var state = use$3((function (param) {
          return {
                  current: Curry._1(initial, undefined)
                };
        }), dependencies, compare);
  var alive = React.useRef(false);
  React.useEffect((function () {
          alive.current = true;
          return (function (param) {
                    alive.current = false;
                    
                  });
        }), []);
  var forceUpdate = use$2(undefined);
  var setState = React.useCallback((function (action) {
          var oldState = state.current;
          var newState = Curry._1(action, oldState);
          if (oldState !== newState) {
            state.current = newState;
            return Curry._1(forceUpdate, undefined);
          }
          
        }), [state]);
  return [
          state.current,
          setState
        ];
}

var FreshState = {
  Dispatch: Dispatch,
  use: use$4
};

var Hooks = {
  Constant: Constant,
  ConstantCallback: ConstantCallback,
  ForceUpdate: ForceUpdate,
  NativeMemo: NativeMemo,
  FreshState: FreshState,
  useConstant: use,
  useForceUpdate: use$2,
  useFreshState: use$4
};

export {
  Result ,
  Hooks ,
  
}
/* react Not a pure module */
