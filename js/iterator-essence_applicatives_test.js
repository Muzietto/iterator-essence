var expect = chai.expect;

describe('an applicative factory', function () {
  describe('built without modifier', function () {
    beforeEach(function () {
      this.factory = APPLICATIVE();
    });
    it('is a named function', function () {
      expect(typeof this.factory).to.be.equal('function');
      expect(this.factory.name).to.be.equal('pure');
    });
    it('builds plain applicative instances', function(){
      this.applicative = this.factory(123);
      expect(this.applicative.is_functor).to.be.true;
      expect(this.applicative.is_applicative).to.be.true;
      expect(this.applicative.star).to.not.be.undefined;
      var result1 = this.applicative.star(function(a) { return a * 2; });
      //expect(result1.is_applicative).to.be.true;
    });
  });
  
  describe('produces maybes that',function(){
    // gotta think harder about this...
    it.skip('ought to behave as applicatives',function(){
      var plus3 = maybeA(function(x){ return x + 3; });
      var starred = plus3.star(maybeA(9));
      expect(starred.value()).to.be.equal(12);
    });
  });

});
