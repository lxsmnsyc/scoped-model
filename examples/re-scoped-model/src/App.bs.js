

import * as Curry from "bs-platform/lib/es6/curry.js";
import * as React from "react";
import * as Caml_obj from "bs-platform/lib/es6/caml_obj.js";
import * as ScopedModel$ReScopedModel from "re-scoped-model/src/ScopedModel.bs.js";

function call(props) {
  var match = React.useState(function () {
        return props;
      });
  var setCount = match[1];
  var decrement = React.useCallback((function (param) {
          return Curry._1(setCount, (function (current) {
                        return current - 1 | 0;
                      }));
        }), []);
  var increment = React.useCallback((function (param) {
          return Curry._1(setCount, (function (current) {
                        return current + 1 | 0;
                      }));
        }), []);
  return {
          decrement: decrement,
          increment: increment,
          count: match[0]
        };
}

var displayName = "Counter";

var shouldUpdate = Caml_obj.caml_equal;

var Counter = {
  call: call,
  displayName: displayName,
  shouldUpdate: shouldUpdate
};

var CounterModel = ScopedModel$ReScopedModel.Make({
      call: call,
      shouldUpdate: shouldUpdate,
      displayName: displayName
    });

function useCount(param) {
  return ScopedModel$ReScopedModel.createSelector(CounterModel.reference, (function (state) {
                console.log(state);
                return state.count;
              }), undefined, param);
}

function App$Count(Props) {
  var count = useCount(undefined);
  return React.createElement("h1", undefined, "Count: " + String(count));
}

var Count = {
  useCount: useCount,
  make: App$Count
};

function useIncrement(param) {
  return ScopedModel$ReScopedModel.createSelector(CounterModel.reference, (function (state) {
                console.log(state);
                return state.increment;
              }), undefined, param);
}

function App$Increment(Props) {
  var increment = useIncrement(undefined);
  return React.createElement("button", {
              onClick: (function (param) {
                  return Curry._1(increment, undefined);
                })
            }, "Increment");
}

var Increment = {
  useIncrement: useIncrement,
  make: App$Increment
};

function useDecrement(param) {
  return ScopedModel$ReScopedModel.createSelector(CounterModel.reference, (function (state) {
                console.log(state);
                return state.decrement;
              }), undefined, param);
}

function App$Decrement(Props) {
  var decrement = useDecrement(undefined);
  return React.createElement("button", {
              onClick: (function (param) {
                  return Curry._1(decrement, undefined);
                })
            }, "Decrement");
}

var Decrement = {
  useDecrement: useDecrement,
  make: App$Decrement
};

function App(Props) {
  return React.createElement(CounterModel.Provider.make, {
              props: 0,
              children: null
            }, React.createElement(CounterModel.Provider.make, {
                  props: 100,
                  children: null
                }, React.createElement(App$Count, {}), React.createElement(App$Increment, {}), React.createElement(App$Decrement, {})), React.createElement(App$Count, {}), React.createElement(App$Increment, {}), React.createElement(App$Decrement, {}));
}

var make = App;

export {
  Counter ,
  CounterModel ,
  Count ,
  Increment ,
  Decrement ,
  make ,
  
}
/* CounterModel Not a pure module */
