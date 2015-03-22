
function APPLICATIVE(modifier){ // function(functor, value)
  'use strict';
  var prototype = Object.create(null);
  prototype.is_functor = true;

  function point() { // variadic because of list
    var args = Array.prototype.slice.apply(arguments);
    var functor = Object.create(prototype);

    functor.fmap = function(fab) {
      // if args[0] is a functor, we invoke its fmap
      if (args[0].is_functor) return args[0].fmap(fab);
      // if args[0] is a function, fmap returns a thunk
      if (typeof args[0] === 'function') {
        return point(function(){ return fab(args[0]()); });
      }
      return point(fab.apply(null,args));
    }
    if (typeof modifier === 'function') {
      args = modifier(functor, args);
    }
    return functor;
  }
  return point;
}

