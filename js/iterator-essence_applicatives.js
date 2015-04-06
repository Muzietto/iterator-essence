
function curried(fun){
  var num_args = fun.length;
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
      function afaFmap(/*mappingFunctions*/){
        var mappingFunctions = Array.prototype.slice.apply(arguments);
        return afa.fmap.apply(null, mappingFunctions);
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

///// UNARY APPLICATIVE aka (->) r //////
var unary = APPLICATIVE(function(applicative, args){
  var curriedFunc = curried(args[0]);
  applicative.fmap = function(unary_fab) {
    return unary(function(x) {
      return curriedFunc(unary_fab.run(x));
    });
  }
  applicative.ap = function(afa){
    if (!afa.is_applicative) throw 'not an applicative!'
    return unary(function(x){
      return curriedFunc(x)(afa.run(x));
    });
  }
  applicative.run = curriedFunc;
  return [curriedFunc];
});

//////// LIST APPLICATIVE ///////////
var list = APPLICATIVE(function(applicative, args){
  // accept any number of arguments given to pure
  applicative.args = args;
  applicative.fmap = function(/*fabs*/) {
    var fabs = Array.prototype.slice.apply(arguments);
    var nextArgs = fabs.reduce(function(acc, curr){ 
      return acc.concat(args.map(curr));
    }, []);
    return list.apply(null,nextArgs);
  }
  applicative.length = args.length;
  applicative.get = function(pos) { return args[pos]; }
  applicative.toString = function(){ return args.reduce(function(a, c){ return a + c + ','}, '[').replace(/,$/, ']'); }
  return args;
});

///// MAYBE APPLICATIVE //////
var maybe = APPLICATIVE(function(applicative, args){
  applicative.is_none = false;
  applicative.is_some = true;
  // discard additional arguments given to pure
  var value = args[0];
  applicative.value = function(){ return value; }

  /*
  applicative.ap = function(afa){
    if (!afa.is_applicative) throw 'not an applicative!'
    // re-implementing the generic applicative.ap
    return maybe(value(afa.value()));
  }
  */
  
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

