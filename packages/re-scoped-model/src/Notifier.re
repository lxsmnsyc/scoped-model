module NativeSet = {
  class type set('a) =
    [@bs]
    {
      pub size: int;
      pub add: 'a => unit;
      pub clear: unit => unit;
      pub delete: 'a => unit;
      pub has: 'a => bool;
      pub forEach: ('a => unit) => unit;
    };

  type t('a) = Js.t(set('a));

  [@bs.new] external make: unit => t('a) = "Set";
};

module Listener = {
  type t('a) = 'a => unit;
};

type t('a) = {
  mutable value: option('a),
  listeners: NativeSet.t(Listener.t('a)),
};

let make = (): t('a) => {
  value: None,
  listeners: NativeSet.make(),
};

let subscribe = (. source: t('a), cb: Listener.t('a)) => {
  source.listeners##add(cb);
  () => {
    source.listeners##delete(cb);
  };
};

let hydrate = (. source: t('a), value: 'a) => {
  if (source.value == None) {
    source.value = Some(value);
  }
};

let emit = (. source: t('a), value: 'a) => {
  source.value = Some(value);
  source.listeners##forEach(
    (listener) => listener(value),
  );
};

let value = (. source: t('a)): 'a => {
  Utils.Result.get(
    .
    source.value,
    Exceptions.DesyncScopedModel,
  );
};