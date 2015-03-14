
function FUNCTOR(modifier) { // function(functor, value)
  'use strict';
  var prototype = Object.create(null);
  prototype.is_functor = true;

  function point() { // variadic because of list
    var args = Array.prototype.slice.apply(arguments);
    var functor = Object.create(prototype);

    // if args[0] is a functor, we invoke its fmap 
    // if args[0] is a function, fmap returns a thunk
    functor.fmap = function(fab) {
      if (args[0].is_functor) return args[0].fmap(fab);
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

///// PROMPT-ALERT -> IO //////
// point receives a function :: () -> a
var IO = FUNCTOR(function(io,args){
  io.run = args[0];
  return [args[0]];
});

// V8 cannot invoke prompt implicitly :-(
function PROMPT(){ return prompt(); }
var getLine = IO(PROMPT);

///// TREE //////
var leaf = FUNCTOR(function(functor,args){
  var label = args[0];
  functor.fmap = function(fab){
    return leaf(fab(label));
  };
  functor.label = function(){ return label; }
  return args;
});

var node = FUNCTOR(function(functor,args){
  var label = args[0];
  var left = args[1];
  var right = args[2];
  
  functor.fmap = function(fab){
    return node(fab(label),left.fmap(fab),right.fmap(fab));
  };

  functor.label = function(){ return label; }
  functor.left = function(){ return left; }
  functor.right = function(){ return right; }
  return args;
});

///// MAYBE //////
var maybe = FUNCTOR(function(functor, args){
  functor.is_none = false;
  // discard additional arguments given to point
  var value = args[0];
  functor.value = function(){ return value; }

  if (value === null 
   || value === NaN 
   || value === Infinity 
   || typeof value === 'undefined'
  ) {
    value = null;
    functor.is_none = true;
    functor.fmap = function(){
      return functor;
    }
    return null;
  }
  // must wrap it for fmap
  return [value];
});

///// THROWER //////
// point receives a function :: () -> a
var thrower = FUNCTOR(function(functor, args){
  functor.extract = args[0];
  return args;
});

//////// LIST ///////////
var list = FUNCTOR(function(functor, args){
  // accept any number of arguments given to point
  functor.args = args;
  functor.fmap = function(fab) {
    var nextArgs = args.map(fab);
    return list.apply(null,nextArgs);
  }
  functor.length = args.length;
  functor.get = function(pos) { return args[pos]; }
  return args;
});
