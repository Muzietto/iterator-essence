var expect = chai.expect;

describe('an applicative factory', function () {
  beforeEach(function () {
    // that's pure
    this.factory = APPLICATIVE();
  });
  describe('built without modifier', function () {
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
  
  describe('produces lists that',function(){
    describe('should contain all possible combinations of inputs',function(){
      it('using unary functions',function(){
        var aaa = list(
          function(x){ return x * 2; },
          function(x){ return x + 100; },
          function(x){ return x * x; }
        );
        var bbb = aaa.ap(list(1,2,3));
        expect(bbb.get(0)).to.be.equal(2);
        expect(bbb.get(3)).to.be.equal(101);
        expect(bbb.get(8)).to.be.equal(9);
      });
      it('using curried n-ary functions',function(){
        var aaa = list(
          curried(function(x, y){ return x + y; }, 2),
          curried(function(x, y){ return x * y; }, 2)
        );
        var bbb = aaa.ap(list(1,2));
        var ccc = bbb.ap(list(3,4));
        expect(ccc.toString()).to.be.equal('[4,5,5,6,3,4,6,8]');
      });
    });
    describe('should allow applicative style',function(){
      it('using fmap along the way',function(){
        var curriedConcat = curried(function(xs, ys){ return xs.concat(ys); });

        var aaa = list('ha','hem','hmm')
           .fmap(curriedConcat)
           .ap(list('?','!','.'));
        expect(aaa.toString()).to.be.equal('[ha?,ha!,ha.,hem?,hem!,hem.,hmm?,hmm!,hmm.]');
      });
      // TODO - implement a case app1.ap(app2).fmap(functs).ap(app3)
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
  
  describe('produces functions as applicatives',function(){
    beforeEach(function () {
      this.plus2 = unary(function(x){ return x + 2; });
      this.times3 = unary(function(x){ return x * 3; });
      this.invert = unary(function(x){ return 1 / x; });
    });
    it('that can be fmapped into function compositions',function(){
      var chain = this.plus2.fmap(this.times3).fmap(this.invert);
      expect(chain.run(5)).to.be.equal(2.6); // 2 + (3 * (1/5))
    });

    it('that allow chains in applicative style',function(){
      // THIS SHALL BE DONE
      // (*) <$> (+3) <*> (*2) $ 2 
      // http://stackoverflow.com/questions/23924540/simple-applicative-functor-example
      var plus3 = unary(function(x){ return x + 3; });
      var times2 = unary(function(x){ return x * 2; });
      var curriedMultiplier = unary(function(x, y){ return x * y; });
      
      var chain = curriedMultiplier.fmap(plus3).ap(times2);
      expect(chain.run(2)).to.be.equal(20);

      var curriedAdder = unary(function(x, y){ return x + y; });
      var chain2 = curriedAdder.ap(times2);
      expect(chain2.run(3)).to.be.equal(9); // 3*2 + 3
      expect(chain2.run(4)).to.be.equal(12); // 4*2 + 4

      // STILL TO BE UNDERSTOOD
      var curriedMixedAdder = unary(function(x, y, z){ return x + y - z; });
      var chain3 = curriedMixedAdder.ap(times2).ap(plus3);
      expect(chain3.run(-4)).to.be.equal(-11); // 
      expect(chain3.run(-3)).to.be.equal(-9); // 
      expect(chain3.run(-2)).to.be.equal(-7); // 
      expect(chain3.run(-1)).to.be.equal(-5); // 
      expect(chain3.run(0)).to.be.equal(-3); // 0+3 0+2 0
      expect(chain3.run(1)).to.be.equal(-1); // 
      expect(chain3.run(2)).to.be.equal(1); // 
      expect(chain3.run(3)).to.be.equal(3); // 
      expect(chain3.run(4)).to.be.equal(5); // 

      // STILL TO BE UNDERSTOOD
      var chain4 = curriedMixedAdder.ap(plus3).ap(times2);
      expect(chain4.run(0)).to.be.equal(3); //
      expect(chain4.run(1)).to.be.equal(3); // 
      expect(chain4.run(2)).to.be.equal(3); // 
      expect(chain4.run(3)).to.be.equal(3); // 
      expect(chain4.run(4)).to.be.equal(3); // 
    });
  });


});
