'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");

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

exports.NativeSet = NativeSet;
exports.Listener = Listener;
exports.make = make;
exports.on = on;
exports.off = off;
exports.sync = sync;
exports.emit = emit;
/* No side effect */
