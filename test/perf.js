/**
 * Created by daniel.irwin on 5/31/16.
 */
describe('performance', function(){

    function generateData(size){
        var array = [];
        for(var i = 0; i < size; ++i){
            array.push({
                label : {
                    en_US : 'label',
                    nb_NO : 'nope'
                }
            });
        }
        return array;
    }

    const Resolver = require('../index');
    var resolver = new Resolver();


    it('1000 in under 10ms', function(){
        this.timeout(10);

        var data = generateData(1000);

        resolver.resolve(data);

    });


    it('10000 in under 50ms', function(){
        this.timeout(50);

        var data = generateData(10000);

        resolver.resolve(data);

    });


    it('100000 in under 175ms', function(){
        this.timeout(325);

        var data = generateData(100000);

        resolver.resolve(data);

    });

    it('perf characteristics', function(){
        this.timeout(1100000);
        function test(size){
            var data = generateData(size);
            var start = new Date().getTime();
            resolver.resolve(data);
            var end = new Date().getTime();
            return end-start;
        }

        for(var i = 1000000; i > 10; i=i/10){
            console.log('\tran', i, 'resolves in', test(i), 'ms');
        }

    });
});