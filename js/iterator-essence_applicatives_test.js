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

      // EXPERIMENTAL: gotta wrap it with curried() to satisfy <*>
      var curriedDoubler = curried(function(a) { return a * 2; }, 1)
      var result2 = applicative123.ap(curriedDoubler);
      expect(result2.args()[0]()[0]).to.be.equal(246);
      // gotta think harder about ap for unaries
      var result3 = result2.ap(curriedDoubler);
      expect(result3.args()[0]()[0]()).to.be.equal(492);
      // chain break here
      var result4 = result3.ap(curriedDoubler);
      //expect(result4.args()[0]()[0]()[0]()).to.be.equal(984);
    });
  });
  
  describe('produces maybes that',function(){
    // gotta think harder about this...
    it.skip('ought to behave as applicatives',function(){
      var plus3 = maybeA(function(x){ return x + 3; });
      var starred = plus3.ap(maybeA(9));
      expect(starred.value()).to.be.equal(12);
    });
  });

});
