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
    it('builds plain and chainable applicative instances', function(){
      var applicative123 = this.factory(123);
      expect(applicative123.is_functor).to.be.true;
      expect(applicative123.is_applicative).to.be.true;
      expect(applicative123.ap).to.not.be.undefined;

      var result1 = applicative123.fmap(function(a) { return a * 2; });
      expect(result1.is_applicative).to.be.true;
      expect(result1.args()[0]).to.be.equal(246);

      //debugger;
      
      // EXPERIMENTAL: gotta wrap it with curried() to satisfy <*>
      var curriedDoubler = curried(function(a) { return a * 2; }, 1)
      //var result2 = applicative123.ap(this.factory(curriedDoubler));
      //expect(result2.args()[0]()[0]).to.be.equal(246);
      // gotta think harder about ap for unaries
      //var result3 = result2.ap(curriedDoubler);
      //expect(result3.args()[0]()[0]()).to.be.equal(492);
      
      //var result4 = result3.ap(curriedDoubler);
      //expect(result4.args()[0]()[0]()[0]()).to.be.equal(984);
    });
  });

  describe('produces maybes that',function(){
    it('ought to behave as applicatives',function(){
      var curriedAdd = curried(function(x, y){ return x + y; });
      debugger;
      // some(4).fmap(x -> y -> x+y) -> some(y -> 4+y)
      //var xxx = maybeA(4).fmap(curriedAdd);
      //expect(xxx.is_applicative).to.be.true;
      // some(y -> 4+y) <*> some(1) -> some(5)
      var yyy = maybeA(curriedAdd).ap(maybeA(1)).ap(maybeA(4));
      expect(yyy.value()).to.be.equal(5);

      // some(x -> y -> x+y) <*> some(1) <*> some(2) -> some(3)
    });
  });

});
