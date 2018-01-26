# i18n-map-resolver
Resolves i18n Maps inside deep objects

[![npm version](https://badge.fury.io/js/i18n-map-resolver.svg)](https://badge.fury.io/js/i18n-map-resolver) [![dependencies](https://david-dm.org/arupex/i18n-map-resolver.svg)](http://github.com/arupex/i18n-map-resolver) ![Build Status](https://api.travis-ci.org/arupex/i18n-map-resolver.svg?branch=master) <a href='https://pledgie.com/campaigns/31873'><img alt='Pledge To Arupex!' src='https://pledgie.com/campaigns/31873.png?skin_name=chrome' border='0' ></a>

Install:

    npm install i18n-map-resolver --save


Example:

    var ResolverFactory = require('i18n-map-resolver');

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

    var options = {};
    /*
     *  availible options include
     *      fallbackMethod : function (key, value, locale, fallback)
     *      detectorMethod : function (key, value)
     *      fallbackLocale : string
     *      decoratorMethod : function(object, key, value, locale, fallback),
     *      maxDepth : number (helps if object has cycle)
     *      report : boolean - whether to report fallbacks and such
    */

    var resolver = new ResolverFactory(options);
    console.log(JSON.stringify(resolver.resolve(input), null, 3);

Expected Output:

    {
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

For More Examples:

    test/test.js