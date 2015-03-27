var expect = chai.expect;

describe('envy',function(){
  
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
  
  describe('if this is pure',function(){

    it('yyyyyyy',function(){
      var cAdd = curry(add,2);
      // some(4).fmap(x -> )
      var someAdd4 = functor.map(cAdd,this.four);
      
      //expect(someAdd4.).to.be.equal(3);
      var  = pluto = 12;
      
    });


  });
  describe('applyFunctor',function(){
    
    it('adds applicatives',function(){
      
      
      
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