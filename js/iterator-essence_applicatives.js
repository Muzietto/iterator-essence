
function APPLICATIVE(modifier){ // function(functor, value)
  'use strict';
  var prototype = Object.create(null);
  prototype.is_functor = true;
  prototype.is_applicative = true;

  function pure() { // variadic because of list
    var args = Array.prototype.slice.apply(arguments);
    var applicative = Object.create(prototype);
    
    applicative.star = function(fab){
      return function(x){
        return applicative.fmap(fab)(x);
      }
    }

    applicative.fmap = function(fab) {
      // if args[0] is a functor, we invoke its fmap
      if (args[0].is_functor) return args[0].fmap(fab);
      // if args[0] is a function, fmap returns a thunk
      if (typeof args[0] === 'function') {
        return pure(function(){ return fab(args[0]()); });
      }
      return pure(fab.apply(null,args));
    }

    if (typeof modifier === 'function') {
      args = modifier(applicative, args);
    }
    return applicative;
  }
  return pure;
}

///// MAYBE APPLICATIVE //////
var maybeA = APPLICATIVE(function(applicative, args){
  applicative.is_none = false;
  applicative.is_some = true;
  // discard additional arguments given to point
  var value = args[0];
  applicative.value = function(){ return value; }

  if (value === null
   || value === NaN
   || value === Infinity
   || typeof value === 'undefined'){
    value = null;
    applicative.is_none = true;
    applicative.is_some = false;
    applicative.fmap = function(){
      return applicative;
    }
    applicative.star = function(fab){
      return applicative;
    }
    return null;
  }
  // must wrap it for fmap
  return [value];
});

