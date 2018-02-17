/**
 * Created by daniel.irwin on 5/31/16.
 */

'use strict';

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
        assert.deepEqual(resolver.resolve(input),{
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

        assert.deepEqual(resolver.resolve(obj), {
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

        assert.deepEqual(defaultResolver.resolve(clone(obj)), {
            label : 'Eng'
        });

        var nbNOResolver = new ResolverFactory({
            locale : 'svc',
            fallbackLocale : 'nb_NO'
        });

        assert.deepEqual(nbNOResolver.resolve(clone(obj)), {
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

        assert.deepEqual(nbNOResolver.resolve(clone(obj)), {
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
            maxDepth : 1
        });

        assert.deepEqual(nbNOResolver.resolve(clone(obj)),  {
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

        assert.deepEqual(nbNOResolver.resolve(clone(obj)),  {
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

        assert.deepEqual(resolver.resolve(clone(obj)),  {
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

        assert.deepEqual(resolver.resolve(clone(obj)),  {
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

        assert.deepEqual(nbNOResolver.resolve(input), [
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

        nbNOResolver.resolve(input);
    });

    it('test it works when localized string map is the root element', function(){
        var input = {
            en_US: 'In Progress',
            nb_NO: '[儲굻ßIn ProgressДß굻]'
        };


        var nbNOResolver = new ResolverFactory({
            locale : 'en_US',
            fallbackLocale : 'en_US'
        });

        assert.deepEqual(nbNOResolver.resolve(input), 'In Progress')

    });



    it('Array of Objects were a property informs the default locale?!', function(){
        var input = [
            {
                defaultLocale : 'en_US',
                label : {
                    en_US : 'en_US',
                    nb : 'nb'
                }
            },
            {
                defaultLocale : 'nb',
                label : {
                    en_US : 'en_US',
                    nb : 'nb'
                }
            },
            {
                defaultLocale : 'jp',
                label : {
                    jp : '',
                    nb : 'nb-when-jp-empty'
                }
            }
        ];
        var nbNOResolver = new ResolverFactory({
            locale : {
                propertyString : 'defaultLocale',
                default : 'nb_NO'
            },
            fallbackLocale : 'en_US'
        });

        let resolved = nbNOResolver.resolve(input);
        console.log('resolved',JSON.stringify(resolved, null,3));
        assert.deepEqual(resolved, [
            {//should pick out en_US
                defaultLocale : 'en_US',
                label : 'en_US'
            },
            {// should pick out nb
                defaultLocale : 'nb',
                label : 'nb'
            },
            {//doesnt have fallback or default so it uses nb
                defaultLocale : 'jp',
                label : 'nb-when-jp-empty'
            }
        ]);
    });


    it('when in an array of possible locales?!', function(){
        var input = {
                supported_locales : [
                    {locale : 'en_US', default : false},
                    {locale : 'nb_NO', default : false},
                    {locale : 'jp_JP', default : true},
                    {locale : 'it_IT', default : false}
                ],
                label : {
                    en_US : 'en_US',
                    nb : 'nb',
                    jp_JP : 'hello world',
                    it_IT : 'italian'
                }
            };
        var nbNOResolver = new ResolverFactory({
            locale : {
                propertyString : 'supported_locales.@default==true.locale',
                default : 'nb_NO'
            },
            fallbackLocale : 'en_US'
        });

        let resolved = nbNOResolver.resolve(input);
        console.log('resolved',JSON.stringify(resolved, null,3));
        assert.deepEqual(resolved, {
            supported_locales : [
                {locale : 'en_US', default : false},
                {locale : 'nb_NO', default : false},
                {locale : 'jp_JP', default : true},
                {locale : 'it_IT', default : false}
            ],
            label :  'hello world'
        });
    });

});