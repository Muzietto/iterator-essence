var expect = chai.expect;

describe("a functor factory", function () {

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

  describe("will produce trees", function () {
    it('that can be something easy to follow', function () {
      var treeA = node(1,node(2,leaf(3),leaf(4)),leaf(5))
      expect(treeA.label()).to.be.equal(1);
      expect(treeA.right().label()).to.be.equal(5);
      expect(treeA.left().label()).to.be.equal(2);
      expect(treeA.left().left().label()).to.be.equal(3);

      var treeM = treeA.fmap(function(x){ return x+x; });
      expect(treeM.label()).to.be.equal(2);
      expect(treeM.right().label()).to.be.equal(10);
      expect(treeM.left().label()).to.be.equal(4);
      expect(treeM.left().left().label()).to.be.equal(6);
    });

    it('that can be fmapped multiple times (easy)', function () {
      var treeA = node(1,node(2,leaf(3),leaf(4)),leaf(5))
      var treeM = treeA.fmap(maybe).fmap(function(x){ return x+x; });
      
      expect(treeM.label().value()).to.be.equal(2);
      expect(treeM.right().label().value()).to.be.equal(10);
      expect(treeM.left().label().value()).to.be.equal(4);
      expect(treeM.left().left().label().value()).to.be.equal(6);
    });

    it('that can be fmapped multiple times (difficult)', function () {
      var treeA = node(1,node(2,leaf('a'),node(4,leaf('b'),leaf('c'))),node(3,node(5,node(7,leaf('d'),leaf('e')),leaf('f')),node(6,leaf('g'),leaf('h'))));
      var treeM = treeA.fmap(maybe).fmap(function(x){ return x + x; });
      expect(treeM.left().label().value()).to.be.equal(4);
      expect(treeM.left().right().left().label().value()).to.be.equal('bb');
      expect(treeM.right().left().left().label().value()).to.be.equal(14);
      expect(treeM.right().left().left().right().label().value()).to.be.equal('ee');
    });
  });

  describe('will produce maybes', function () {
    it('that can wrap a value', function () {
      var maybeA = maybe(123);
      expect(maybeA.value()).to.be.equal(123);
      expect(maybeA.is_none).to.be.false;

      var maybeB = maybe(1/0);
      expect(maybeB.value()).to.be.null;
      expect(maybeB.is_none).to.be.true;
    });

    it('that can fmap a function and protect its run from nulls', function () {
      var mappingF = function(a){
        if (typeof a === 'number' && !isNaN(a)) {
          return 'good';
        } else {
          return null;
        }
      }
      // this one will crash if given a null
      var doubler = function(x){ return x+x; }

      var maybeA = maybe(123).fmap(parseInt).fmap(mappingF).fmap(doubler);
      expect(maybeA.is_none).to.be.false;
      expect(maybeA.value()).to.be.equal('goodgood');

      var maybeB = maybe('qwe').fmap(parseInt).fmap(mappingF).fmap(doubler);
      expect(maybeB.is_none).to.be.true;
      expect(maybeB.value()).to.be.null;
    });

    it('that can be put halfway the chain and protect it for the rest of the run', function () {
      var treeA = node(1,node(2,leaf(3),leaf(4)),leaf(5))
      var treeM = treeA
                    .fmap(maybe)
                    .fmap(function(val){ return (val > 3) ? undefined : val; })
                    .fmap(function(x){ return x + x; });
      
      expect(treeM.label().value()).to.be.equal(2);
      expect(treeM.right().label().value()).to.be.equal(null);
      expect(treeM.right().label().is_none).to.be.true;
      expect(treeM.left().label().value()).to.be.equal(4);
      expect(treeM.left().right().label().value()).to.be.equal(null);
      expect(treeM.left().right().label().is_none).to.be.true;
      
      var treeMM = treeM.fmap(function(x){ return x + x; });
      
      expect(treeMM.label().value()).to.be.equal(4);
      expect(treeMM.right().label().value()).to.be.equal(null);
      expect(treeMM.right().label().is_none).to.be.true;
      expect(treeMM.left().label().value()).to.be.equal(8);
      expect(treeMM.left().right().label().value()).to.be.equal(null);
      expect(treeMM.left().right().label().is_none).to.be.true;
    });
  });

  describe("will produce IO actions", function () {
    beforeEach(function(){
      this.getLine = IO(PROMPT);
    });
    it.skip('that are lazy in the simplest situation', function () {
      this.timeout(60*1000);
      alert(this.getLine.run());
    })
    it.skip('that will be lazy in any situation', function () {
      this.timeout(60*1000);
      var eniLteg = this.getLine.fmap(function(a){ return a.reverse(); });
      alert(eniLteg.run());
    })
    it.skip('that can be fmapped ad libitum', function () {
      var self = this;
      this.timeout(60*1000);
      this.reverse = function(a){ return a.reverse(); };
      this.toUpperCase = function(a){ return a.toUpperCase(); };
      this.intersperse = function(i){
        return function(a) { return inter(a).slice(0,-1); }
        function inter(a){
          var alength = Math.floor(a.length / 2);
          if (alength < 1) return a + i;
          return inter(a.substring(0,alength))
                   + inter(a.substring(alength))
        }
      }
      var E_N_I_L_T_E_G = this.getLine
                       .fmap(this.reverse)
                       .fmap(this.intersperse('_'))
                       .fmap(this.toUpperCase)
                       .fmap(alert);
      E_N_I_L_T_E_G.run();
    })
  });

  describe("will produce throwers", function () {
    it('that can wrap a function and make it lazy', function () {
      var fun = function(){ throw(new Error); }
      var throwerA = thrower(fun);
      expect(throwerA.extract).to.be.equal(fun);
      expect(throwerA.extract).to.throw(Error);
    });

    it('that can fmap a function and make its application lazy', function () {
      var fun = function(){ return 1; }
      var mappingF = function(a){ throw a; }
      var throwerA = thrower(fun);
      var throwerB = throwerA.fmap(mappingF);
      expect(throwerB.extract).to.not.be.undefined;
      expect(throwerB.extract).to.throw(1);
    });

    it('that can be chain-mapped over unary functions', function () {
      var fun = function(){ return 1; }
      var mappingFa = function(a){ throw a; }
      var mappingFb = function(a){ return 2*a; }
      var throwerA = thrower(fun);
      var throwerB = throwerA.fmap(mappingFa).fmap(mappingFb);
      var throwerC = throwerA.fmap(mappingFb).fmap(mappingFa);
      expect(throwerB.extract).to.throw(1);
      expect(throwerC.extract).to.throw(2);
    });

    it.skip('that can prepare and manage a delayed input', function () {
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
  
  describe("will produce lists", function () {
    it('that can wrap no value (aka empty list)', function () {
      var listA = list();
      expect(listA.length).to.be.equal(0);
      expect(listA.get(0)).to.be.undefined;
      expect(listA.fmap(function(x) { return x+x; }).get(0)).to.be.undefined;
    });

    it('that can wrap a single value', function () {
      var listA = list('a');
      expect(listA.length).to.be.equal(1);
      expect(listA.get(0)).to.be.equal('a');
      expect(listA.fmap(function(x) { return x+x; }).get(0)).to.be.equal('aa');
    });

    it('that can wrap more values at the same time', function () {
      var listA = list('a','b',123);
      expect(listA.length).to.be.equal(3);
      expect(listA.get(0)).to.be.equal('a');
      expect(listA.get(2)).to.be.equal(123);
      expect(listA.fmap(function(x) { return x+x; }).get(0)).to.be.equal('aa');
      expect(listA.fmap(function(x) { return x+x; }).get(2)).to.be.equal(246);
    });

    it('that can be chain-mapped over unary functions', function () {
      var listA = list('a','b',3);
      var doubler = function(x) { return x+x; }
      var tripler = function(x) { return x+x+x; }
      expect(listA.fmap(doubler).fmap(tripler).get(0)).to.be.equal('aaaaaa');
      expect(listA.fmap(doubler).fmap(tripler).get(2)).to.be.equal(18);
    });    
  });
});