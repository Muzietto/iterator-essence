
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
    // kinda too easy...
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
      // gotta preserve multiple args
      return afaFmap.apply(null, args);
      function afaFmap(mappingFunctions){
        return afa.fmap(mappingFunctions);
      }
    }

    applicative.fmap = function(fab) {
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
var maybe = APPLICATIVE(function(applicative, args){
  applicative.is_none = false;
  applicative.is_some = true;
  // discard additional arguments given to pure
  var value = args[0];
  applicative.value = function(){ return value; }

  applicative.xap = function(afa){
    if (!afa.is_applicative) throw 'not an applicative!'
    return maybe(value(afa.value()));
  }
  
  if (value === null
   || (typeof value !== 'function' && isNaN(value))
   || value === Infinity
   || typeof value === 'undefined'){
    // let's build the none 
    value = null;
    applicative.is_none = true;
    applicative.is_some = false;
    applicative.fmap = function(){
      return applicative;
    }
    applicative.ap = function(afa){
      return applicative;
    }
    return null;
  }
  // must wrap it for fmap
  return [value];
});

