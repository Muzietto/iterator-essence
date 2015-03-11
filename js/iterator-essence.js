function FUNCTOR(modifier) { // function(functor, value)
  'use strict';
  
  var prototype = Object.create(null);
  prototype.is_functor = true;
  
  function point() { // variadic
    var args = Array.prototype.slice.apply(arguments);
    var functor = Object.create(prototype);
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
  functor.args = args;
  functor.fmap = function(fab) {
    var nextArgs = args.map(fab);
    return list.apply(null,nextArgs);
  }
  functor.length = args.length;
  functor.get = function(pos) { return args[pos]; }
  return args;
});
