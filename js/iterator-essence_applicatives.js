
function curried(fun,num_args){
  var result = function(value){
    if (num_args <= 1){
      return fun(value);
    } else {
      var partial = fun.bind(undefined, value);
      return curried(partial, num_args - 1);
    }
  }
  result.is_curried = true;
  return result;
}

function APPLICATIVE(modifier){ // function(functor, value)
  'use strict';
  var prototype = Object.create(null);
  prototype.is_functor = true;
  prototype.is_applicative = true;

  function pure() { // variadic because of list
    var args = Array.prototype.slice.apply(arguments);
    var applicative = Object.create(prototype);
    applicative.args = function(){ return args; }

    /* ap aka <*>
     * <*> :: af (a -> b) -> af a -> af b
     * af (a -> b) <*> :: af a -> af b
     * af (a -> b) <*> af a :: af b
     * ATTENTION!!!: therefore, <*> has a meaning 
     * only when it belongs to an af (a -> b)
     * EXAMPLES OF af(a->b): 
     * EX1: pure(x->2*x)
     * EX2: pure(12).fmap(x->2*x)
     * EX3: pure(x->y->x+y)
     * EX4: pure(12).fmap(x->y->x+y) <-- doubtful...
     */
    applicative.ap = function(afa){
      if (!afa.is_applicative) throw 'not an applicative!'
      var fmapping = applicative.fmap(afa);
      if (fmapping.is_applicative) {
        // monad smell here...
        return pure( function(){ return fmapping.args(); });
      } else {
        return pure(function(x){
          return fmapping(x);
        });
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
    // let's build the none 
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

