# i18n-map-resolver
Resolves i18n Maps inside deep objects

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
     *      maxLoops : number (helps if object has cycle)
     *      report : boolean - whether to report fallbacks and such
    */

    var resolver = new ResolverFactory(options);
    console.log(JSON.stringify(resolver(input), null, 3);

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