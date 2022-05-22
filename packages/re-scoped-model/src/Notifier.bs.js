

import * as Curry from "bs-platform/lib/es6/curry.js";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";
import * as Utils$ReScopedModel from "./Utils.bs.js";
import * as Exceptions$ReScopedModel from "./Exceptions.bs.js";

var NativeSet = {};

var Listener = {};

function make(param) {
  return {
          value: undefined,
          listeners: new Set()
        };
}

function subscribe(source, cb) {
  source.listeners.add(cb);
  return function (param) {
    return source.listeners.delete(cb);
  };
}

function hydrate(source, value) {
  if (source.value === undefined) {
    source.value = Caml_option.some(value);
    return ;
  }
  
}

function emit(source, value) {
  source.value = Caml_option.some(value);
  return source.listeners.forEach(function (listener) {
              return Curry._1(listener, value);
            });
}

function value(source) {
  return Utils$ReScopedModel.Result.get(source.value, {
              RE_EXN_ID: Exceptions$ReScopedModel.DesyncScopedModel
            });
}

export {
  NativeSet ,
  Listener ,
  make ,
  subscribe ,
  hydrate ,
  emit ,
  value ,
  
}
/* Utils-ReScopedModel Not a pure module */
