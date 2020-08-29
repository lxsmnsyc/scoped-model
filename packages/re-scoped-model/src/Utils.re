module Result = {
  let get = (value: option('a), err: exn) => {
    switch (value) {
      | Some(actualValue) => actualValue;
      | None => raise(err);      
    }
  }
};

module Hooks = {
  let useConstant = (supplier: unit => 'a): 'a => {
    let ref = React.useRef(None);

    switch (ref.current) {
      | Some(value) => value;
      | None => {
        let value = supplier();
        ref.current = Some(value);
        value;
      };
    }
  };
};