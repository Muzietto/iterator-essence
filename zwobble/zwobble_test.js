var expect = chai.expect;

describe('exploring all these static methods',function(){
  
  beforeEach(function(){
    this.four = some(4);
    this.six = some(6);

  });

  describe('method curry',function(){

    it('accepts params one at a time',function(){
      var cAdd = curry(add,2);
      expect(cAdd(1)(2)).to.be.equal(3);
      expect(cAdd(1)(-1)).to.be.equal(0);
    });
  });
  
  describe('method map/fmap',function(){

    it('can start the applicative chain',function(){
      var curriedAdd = curry(add,2);

      // some(4).fmap(x -> y -> x+y)
      var someAdd4 = functor.map(curriedAdd,some(4));
      var funcInTheSome = someAdd4.bind(function(x){ return x; });
      expect(funcInTheSome(3)).to.be.equal(7);
    });


  });
  describe('method applyFunctor',function(){
    
    it('continues the applicative chain',function(){
      var curriedAdd = curry(add,2);
      var someAdd4 = functor.map(curriedAdd,some(4));
      // someAdd4 <*> some(1)
      var usingStar = applyFunctor(someAdd4,some(1));

      expect(usingStar.bind(function(x){ return x; })).to.be.equal(5);      
    });
    
    it('handles none\'s respectfully',function(){
      var curriedAdd = curry(add,2);
      var someAdd4 = functor.map(curriedAdd,none);
      // none <*> some(1)
      var usingStar = applyFunctor(someAdd4,some(1));

      expect(usingStar.toString()).to.be.equal('none');      
    });
    
  });
  
  
  
  
})

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