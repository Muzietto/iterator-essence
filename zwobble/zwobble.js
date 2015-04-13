
// http://mike.zwobble.org/2012/09/applicative-functors-in-uncurried-languages/

var none = {
    map: function(func) {
        return none;
    },
    
    bind: function(func) {
        return none;
    },
    
    toString: function() {
        return "none";
    }
};

function some(value) {
    return {
        map: function(func) {
            return some(func(value));
        },
        
        bind: function(func) {
            return func(value);
        },
        
        toString: function() {
            return "some(" + value + ")";
        }
    };
}

var functor = {
    map: function(func, option) {
        return option.map(func)
    },
    unit: some,
    applyFunctor: function(funcOption, argOption) {
        return funcOption.bind(function(func) {
            return argOption.map(func);
        });
    }
};

function curry(func/*, numberOfArguments*/) {
    var numberOfArguments = func.length;
    return function(value) {
        if (numberOfArguments === 1) {
            return func(value);
        } else {
            return curry(func.bind(null, value)/*, numberOfArguments - 1*/);
        }
    };
}

function add(first, second) {
    return first + second;
};

functor.applyFunctorUncurried = function(func/*, args*/) {
    var args = Array.prototype.slice.call(arguments, 1);
    return args.reduce(
        functor.applyFunctor,
        functor.unit(curry(func, args.length))
    );
}

function applyFunctor(funcFunctor, argFunctor) {
    return functor.applyFunctorUncurried(apply, funcFunctor, argFunctor);
}

function apply(func, value) {
    return func(value);
}

var four = some(4);
var six = some(6);

functor.applyFunctor(functor.map(curry(add, 2), four), six);
// => some(10)
functor.applyFunctor(functor.map(curry(add, 2), none), six);
// => none
functor.applyFunctor(functor.map(curry(add, 2), four), none);
// => none

functor.applyFunctorUncurried(add, four, six);
// => some(10)
functor.applyFunctorUncurried(add, none, six);
// => none
functor.applyFunctorUncurried(add, four, none);
// => none