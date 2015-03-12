var expect = chai.expect;

describe("a functor factory", function () {

//  expect(minElem(res)).to.be.null;
//  expect(minElem(res)).to.be.equal(12);
//  expect(balanced(res)).to.be.true;

  describe("built without modifier", function () {
    beforeEach(function () {
      this.factory = FUNCTOR();
    });
    it('is a named function', function () {
      expect(typeof this.factory).to.be.equal('function');
      expect(this.factory.name).to.be.equal('point');
    });
    it('builds plain functor instances', function(){
      this.functor = this.factory(123);
      expect(this.functor.is_functor).to.be.true;
      expect(this.functor.fmap).to.not.be.undefined;
      var result1 = this.functor.fmap(function(a) { return a*2; });
      expect(result1.is_functor).to.be.true;
    });
  })

  describe("called maybe", function () {
    it('can wrap a value', function () {
      var maybeA = maybe(123);
      expect(maybeA.value()).to.be.equal(123);
      expect(maybeA.is_none).to.be.false;

      var maybeB = maybe(1/0);
      expect(maybeB.value()).to.be.null;
      expect(maybeB.is_none).to.be.true;
    });

    it.skip('can fmap a function and protect its run from nulls', function () {
      var fmapped = function(a){ return a; }
    });
  });

  describe("called thrower", function () {
    it('can wrap a function and make it lazy', function () {
      var fun = function(){ throw(new Error); }
      var throwerA = thrower(fun);
      expect(throwerA.extract).to.be.equal(fun);
      expect(throwerA.extract).to.throw(Error);
    });

    it('can fmap a function and make its application lazy', function () {
      var fun = function(){ return 1; }
      var mappingF = function(a){ throw a; }
      var throwerA = thrower(fun);
      var throwerB = throwerA.fmap(mappingF);
      expect(throwerB.extract).to.not.be.undefined;
      expect(throwerB.extract).to.throw(1);
    });

    it('can be chain-mapped over unary functions', function () {
      var fun = function(){ return 1; }
      var mappingFa = function(a){ throw a; }
      var mappingFb = function(a){ return 2*a; }
      var throwerA = thrower(fun);
      var throwerB = throwerA.fmap(mappingFa).fmap(mappingFb);
      var throwerC = throwerA.fmap(mappingFb).fmap(mappingFa);
      expect(throwerB.extract).to.throw(1);
      expect(throwerC.extract).to.throw(2);
    });

    it('can prepare and manage a delayed input', function () {
      this.timeout(60*1000);
      var fun = function(){
        return prompt('first time give a DIGIT, second time give a CHARACTER');
      }
      var mappingF = function(a){
        if (typeof a === 'number' && !isNaN(a)) {
          return 'good';
        } else {
          throw 'bad';
        }
      }
      var throwerA = thrower(fun);
      var throwerB = throwerA.fmap(parseInt).fmap(mappingF);
      expect(throwerB.extract).to.not.be.undefined;
      // first time give a DIGIT
      expect(throwerB.extract()).to.be.equal('good');
      // second time give a CHARACTER
      expect(throwerB.extract).to.throw('bad');
    });
  });
  
  describe("called list", function () {

    it('can wrap no value', function () {
      var listA = list();
      expect(listA.length).to.be.equal(0);
      expect(listA.get(0)).to.be.undefined;
      expect(listA.fmap(function(x) { return x+x; }).get(0)).to.be.undefined;
    });
    
    it('can wrap a single value', function () {
      var listA = list('a');
      expect(listA.length).to.be.equal(1);
      expect(listA.get(0)).to.be.equal('a');
      expect(listA.fmap(function(x) { return x+x; }).get(0)).to.be.equal('aa');
    });
    
    it('can wrap more values at the same time', function () {
      var listA = list('a','b',123);
      expect(listA.length).to.be.equal(3);
      expect(listA.get(0)).to.be.equal('a');
      expect(listA.get(2)).to.be.equal(123);
      expect(listA.fmap(function(x) { return x+x; }).get(0)).to.be.equal('aa');
      expect(listA.fmap(function(x) { return x+x; }).get(2)).to.be.equal(246);
    });
    
    it('can be chain-mapped over unary functions', function () {
      var listA = list('a','b',3);
      var doubler = function(x) { return x+x; }
      var tripler = function(x) { return x+x+x; }
      expect(listA.fmap(doubler).fmap(tripler).get(0)).to.be.equal('aaaaaa');
      expect(listA.fmap(doubler).fmap(tripler).get(2)).to.be.equal(18);
    });    
  });
});