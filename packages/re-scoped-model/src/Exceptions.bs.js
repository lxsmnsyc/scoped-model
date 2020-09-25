'use strict';

var Caml_exceptions = require("bs-platform/lib/js/caml_exceptions.js");

var MissingScopedModel = Caml_exceptions.create("Exceptions-ReScopedModel.MissingScopedModel");

var DesyncScopedModel = Caml_exceptions.create("Exceptions-ReScopedModel.DesyncScopedModel");

exports.MissingScopedModel = MissingScopedModel;
exports.DesyncScopedModel = DesyncScopedModel;
/* No side effect */
