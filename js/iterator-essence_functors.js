function FUNCTOR(modifier) { // function(functor, value)
  'use strict';
  
  var prototype = Object.create(null);
  prototype.is_functor = true;
  
  function point() { // variadic
    var args = Array.prototype.slice.apply(arguments);
    var functor = Object.create(prototype);
    
    // TODO: if args are functors, should invoke their fmap 
    functor.fmap = function(fab) {
      return point(fab.apply(null,args));
    }
    
    if (typeof modifier === 'function') {
      args = modifier(functor, args);
    }
    return functor;
  }
  return point;
}

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

// point receives a function :: () -> a
var thrower = FUNCTOR(function(functor, args){
  functor.fmap = function(fab){
    return thrower(function(){
      return fab(args[0]());
    })
  }
  functor.extract = args[0];
  return args;
});

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
