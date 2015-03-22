var expect = chai.expect;

describe('an applicative factory', function () {
  describe('built without modifier', function () {
    beforeEach(function () {
      this.factory = APPLICATIVE();
    });
    it('is a named function', function () {
      expect(typeof this.factory).to.be.equal('function');
      expect(this.factory.name).to.be.equal('point');
    });
    it('builds plain functor instances', function(){
      this.functor = this.factory(123);
      expect(this.functor.is_functor).to.be.true;
      expect(this.functor.fmap).to.not.be.undefined;
      var result1 = this.functor.fmap(function(a) { return a * 2; });
      expect(result1.is_functor).to.be.true;
    });
  });

});
