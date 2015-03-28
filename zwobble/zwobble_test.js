var expect = chai.expect;

describe('exploring all these static methods',function(){

  describe('method curry',function(){
    it('accepts params one at a time',function(){
      var curriedAdd = curry(add,2);
      expect(curriedAdd(1)(2)).to.be.equal(3);
      expect(curriedAdd(1)(-1)).to.be.equal(0);
    });
  });

  describe('method some, aka pure',function(){
    it('can wrap values at the head of the functor chain',function(){
      var some1 = some(1);
      // extract the boxed value with this unconventional 'bind'
      expect(some1.bind(function(x){ return x; })).to.be.equal(1);
    });
    it('can wrap unary functions (but without <*> this leads nowhere...)',function(){
      var someAdd1 = some(function(x){ return x + 1; });
      // extract the boxed value with this unconventional 'bind'
      expect(someAdd1.bind(function(x){ return x; })(2)).to.be.equal(3);
    });
    it('can wrap unary functions and kick ass together with <*>',function(){
      var someAdd1 = some(function(x){ return x + 1; });
      // some(x -> x+1) <*> some(2) -> some(3)
      var someAdd1StarSome2 = applyFunctor(someAdd1,some(2));
      expect(someAdd1StarSome2.bind(function(x){ return x; })).to.be.equal(3);

      var curriedAdd = curry(add,2);
      // some(x -> y -> x+y) <*> some(1) <*> some(2) -> some(3)
      // static methods mean ugly pyramides
      var ccchain = applyFunctor(applyFunctor(some(curriedAdd),some(1)),some(2));
      expect(ccchain.bind(function(x){ return x; })).to.be.equal(3);
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
    it('and be followed by <*>',function(){
      var curriedAdd = curry(add,2);
      // some(4).fmap(x -> y -> x+y) -> some(y -> 4+y)
      var someAdd4 = functor.map(curriedAdd,some(4));
      // some(4).fmap(x -> y -> x+y) <*> some(2) -> some(6)
      var ccchain = applyFunctor(someAdd4,some(2));
      expect(ccchain.bind(function(x){ return x; })).to.be.equal(6);
    });
  });

  describe('method applyFunctor, aka <*> or star',function(){
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
