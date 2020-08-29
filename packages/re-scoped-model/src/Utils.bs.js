

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

function useConstant(supplier) {
  var ref = React.useRef(undefined);
  var value = ref.current;
  if (value !== undefined) {
    return Caml_option.valFromOption(value);
  }
  var value$1 = Curry._1(supplier, undefined);
  ref.current = Caml_option.some(value$1);
  return value$1;
}

var Hooks = {
  useConstant: useConstant
};

export {
  Result ,
  Hooks ,
  
}
/* react Not a pure module */
