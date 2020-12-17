'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var Utils$ReScopedModel = require("./Utils.bs.js");
var Exceptions$ReScopedModel = require("./Exceptions.bs.js");

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

exports.NativeSet = NativeSet;
exports.Listener = Listener;
exports.make = make;
exports.subscribe = subscribe;
exports.hydrate = hydrate;
exports.emit = emit;
exports.value = value;
/* Utils-ReScopedModel Not a pure module */
