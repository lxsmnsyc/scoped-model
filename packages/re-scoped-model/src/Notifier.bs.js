

import * as Curry from "bs-platform/lib/es6/curry.js";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";

var NativeSet = { };

var Listener = { };

function make(param) {
  return {
          currentValue: undefined,
          listeners: new Set()
        };
}

function on(source, cb) {
  return source.listeners.add(cb);
}

function off(source, cb) {
  return source.listeners.delete(cb);
}

function sync(source, value) {
  source.currentValue = Caml_option.some(value);
  
}

function emit(source, value) {
  source.currentValue = Caml_option.some(value);
  return source.listeners.forEach((function (listener) {
                return Curry._1(listener, value);
              }));
}

export {
  NativeSet ,
  Listener ,
  make ,
  on ,
  off ,
  sync ,
  emit ,
  
}
/* No side effect */
