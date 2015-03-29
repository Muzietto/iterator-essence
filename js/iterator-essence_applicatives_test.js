var expect = chai.expect;

describe('an applicative factory', function () {
  describe('built without modifier', function () {
    beforeEach(function () {
      // that's pure
      this.factory = APPLICATIVE();
    });
    it('is a named function', function () {
      expect(typeof this.factory).to.be.equal('function');
      expect(this.factory.name).to.be.equal('pure');
    });
    it('builds plain applicative instances', function(){
      var applicative123 = this.factory(123);
      expect(applicative123.is_functor).to.be.true;
      expect(applicative123.is_applicative).to.be.true;
      expect(applicative123.ap).to.not.be.undefined;
    });
    it('builds fmap-able applicative instances', function(){
      var applicative123 = this.factory(123);

      var applicative246 = applicative123.fmap(function(a) { return a * 2; });
      expect(applicative246.is_applicative).to.be.true;
      expect(applicative246.args()[0]).to.be.equal(246);

      var applicative492 = applicative123
          .fmap(function(a) { return a * 2; })
          .fmap(function(a) { return a * 2; });
      expect(applicative492.is_applicative).to.be.true;
      expect(applicative492.args()[0]).to.be.equal(492);
    });
    it('builds chainable/applicable applicative instances', function(){
      var applicative123 = this.factory(123);
      var applicative246 = applicative123.fmap(function(a) { return a * 2; });
      var applicative492 = applicative246.fmap(function(a) { return a * 2; });

      var curriedAdder = curried(function(a,b,c) { return a+b+c; }, 3);

      var appSum1 = this.factory(curriedAdder)
        .ap(applicative123)
        .ap(applicative246)
        .ap(applicative492);
      // using the custom-built applicative.args()
      expect(appSum1.args()[0]).to.be.equal(861);

      var appSum2 = applicative123
        .fmap(curriedAdder)
        .ap(applicative246)
        .ap(applicative492);
      expect(appSum2.args()[0]).to.be.equal(861);
    });
  });

  describe('produces maybes that',function(){
    it('behave as applicatives',function(){
      var curriedMultiplier = curried(function(x, y){ return x * y; }, 2);

      // some(4).fmap(x -> y -> x+y) -> some(y -> 4+y)
      var someQuadrupler = maybe(4).fmap(curriedMultiplier);
      // some(y -> 4*y) <*> some(2) -> some(8)
      var some8 = someQuadrupler.ap(maybe(2));
      expect(some8.value()).to.be.equal(8);

      // some(x -> y -> x*y) <*> some(2) <*> some(3) -> some(6)
      var someDoubler = maybe(curriedMultiplier).ap(maybe(2));
      var some6 = someDoubler.ap(maybe(3));
      expect(some6.value()).to.be.equal(6);
    });
    it('smoothly take care of nones',function(){
      var curriedDivider = curried(function(x, y){ return y / x; }, 2);

      // some('abc').fmap(x -> y -> y/x) -> none
      var hopeless1 = maybe('abc').fmap(curriedDivider);
      // none <*> some(2) -> none
      var hopeless2 = hopeless1.ap(maybe(2));
      expect(hopeless2.is_none).to.be.true;

      // some(x -> y -> y/x) <*> some(0) <*> some(3) -> none
      var zeroDivisorNone = maybe(curriedDivider).ap(maybe(0));
      var hopeless3 = zeroDivisorNone.ap(maybe(3));
      expect(hopeless3.is_none).to.be.true;
    });
  });
});
