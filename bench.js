const update_search = require('./search');
var Benchmark = require('benchmark');

var suite = new Benchmark.Suite;

suite.add('query-long', function() {
        update_search("Base.LinAlg.BLAS.gemm!");
    })
    .add('query-short', function() {
        update_search("get");
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run();
