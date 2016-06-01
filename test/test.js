/**
 * Created by daniel.irwin on 5/31/16.
 */
describe('i18n-map-resolver', function(){

    function clone(data){
        if(data){
            return JSON.parse(JSON.stringify(data));
        }
    }


    var ResolverFactory = require('../index');

    var assert = require('assert-diff');

    it('Happy Path', function(){
        var input = {
            randomField : 'random',
            label : {
                en_US : 'English 1',
                es_VE : 'Spanish 1',
                nb_NO : 'Norwegian 1'
            },
            label1 : {
                en_US : 'English 2',
                es_VE : 'Spanish 2',
                nb_NO : 'Norwegian 2'
            },
            randomObject : {
                aValue : 'value',
                aTest : 'test'
            },
            number : 7,
            array : [
                {
                    label : {
                        en_US : 'English Inner',
                        es_VE : 'Spanish Inner',
                        nb_NO : 'Norwegian Inner'
                    }
                }
            ]
        };

        var resolver = new ResolverFactory();
        assert.deepEqual(resolver(input),{
         randomField: 'random',
            label: 'English 1',
            label1: 'English 2',
            randomObject: { aValue: 'value', aTest: 'test' },
            number : 7,
            array : [
                {
                    label : 'English Inner'
                }
            ]
        });
    });

    it('Pass in Lang', function(){
        var obj = {
            label : {
                en_US : 'Eng',
                nb_NO : 'Nor'
            }
        };

        var resolver = new ResolverFactory({ locale : 'nb_NO' });

        assert.deepEqual(resolver(obj), {
            label : 'Nor'
        });
    });

    it('Fallback', function(){
        var obj = {
            label : {
                en_US : 'Eng',
                nb_NO : 'Nor'
            }
        };

        var defaultResolver = new ResolverFactory({ locale : 'svc' });

        assert.deepEqual(defaultResolver(clone(obj)), {
            label : 'Eng'
        });

        var nbNOResolver = new ResolverFactory({
            locale : 'svc',
            fallbackLocale : 'nb_NO'
        });

        assert.deepEqual(nbNOResolver(clone(obj)), {
            label : 'Nor'
        });
    });

    it('Fallback to partial', function(){
        var obj = {
            label : {
                en_US : 'Eng',
                nb : 'Nor'
            }
        };

        var nbNOResolver = new ResolverFactory({
            locale : 'nb_NO',
            fallbackLocale : 'en_US'
        });

        assert.deepEqual(nbNOResolver(clone(obj)), {
            label : 'Nor'
        });
    });

    it('max loop', function(){
        var obj = {
            prop1 : '',
            prop2 : '',
            prop3 : {
                prop4: {
                    en_US: 'Eng',
                    nb: 'Nor'
                }
            }
        };

        var nbNOResolver = new ResolverFactory({
            locale : 'nb_NO',
            fallbackLocale : 'en_US',
            maxLoop : 1
        });

        assert.deepEqual(nbNOResolver(clone(obj)),  {
            prop1 : '',
            prop2 : '',
            prop3 : {
                prop4: {
                        en_US: 'Eng',
                        nb: 'Nor'
                    }
            }
        });
    });

    it('report', function(){
        var obj = {
            fallback : {
                en_US : 'fallback'
            }
        };

        var nbNOResolver = new ResolverFactory({
            locale : 'nb_NO',
            report : true
        });

        assert.deepEqual(nbNOResolver(clone(obj)),  {
            result :{
                fallback : 'fallback'
            },
            report : {
                fallbacks: {
                    'fallback:fallback': {
                        en_US: "fallback"
                    }
                }
            }
        });
    });

    it('Enhanced Decorator', function(){
        var obj = {
            fallback : {
                en_US : 'fallback'
            }
        };

        var resolver = new ResolverFactory({
            decoratorMethod : function(object, key, value, locale, fallback){
                object[key + '.' + locale + '.' + fallback] = value;
                delete object[key];
            }
        });

        assert.deepEqual(resolver(clone(obj)),  {
            'fallback.en_US.en_US': 'fallback'
        });
    });

    it('Enhanced Fallback', function(){
        var obj = {
            fallback : {
                en_US : 'fallback'
            }
        };

        var resolver = new ResolverFactory({
            locale : 'none',
            fallbackMethod : function(key, value, locale, fallbackLocale){
                return key + '.' + value.en_US + '.' +  locale + '.' + fallbackLocale;
            }
        });

        assert.deepEqual(resolver(clone(obj)),  {
            fallback: 'fallback.fallback.none.en_US'
        });
    });

    it('Array of Objects', function(){
        var input = [
            {
                label : {
                    en_US : '1',
                    nb : '4'
                }
            },
            {
                label : {
                    en_US : '2',
                    nb : '5'
                }
            },
            {
                label : {
                    en_US : '3',
                    nb : '6'
                }
            }
        ];
        var nbNOResolver = new ResolverFactory({
            locale : 'nb_NO',
            fallbackLocale : 'en_US'
        });

        assert.deepEqual(nbNOResolver(input), [
            {
                label : '4'
            },
            {
                label : '5'
            },
            {
                label : '6'
            }
        ]);
    });

    it('undefined', function(){
        var input = undefined;

        var nbNOResolver = new ResolverFactory({
            locale : 'nb_NO',
            fallbackLocale : 'en_US'
        });

        nbNOResolver(input);
    })

});