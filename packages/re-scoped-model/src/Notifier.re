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
  mutable currentValue: option('a),
  listeners: NativeSet.t(Listener.t('a)),
};

let make = (): t('a) => {
  currentValue: None,
  listeners: NativeSet.make(),
};

let on = (source: t('a), cb: Listener.t('a)) => {
  source.listeners##add(cb);
};

let off = (source: t('a), cb: Listener.t('a)) => {
  source.listeners##delete(cb);
};

let sync = (source: t('a), value: 'a) => {
  source.currentValue = Some(value);
};

let emit = (source: t('a), value: 'a) => {
  sync(source, value);
  source.listeners##forEach(
    (listener) => listener(value),
  );
};
