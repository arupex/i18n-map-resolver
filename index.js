/**
 * Created by dirwin517 on 5/31/16.
 */

/**
 * Resolves i18n Maps
 *  What are i18n Maps?
 *      {
 *          name : 'an object'
 *          label : {
 *              en_US : 'english label',
 *              es_VE : 'sello español'
 *          },
 *          deeperObject : {
 *              deeperLabel : {
 *                  en_US : 'english label',
 *                  es_VE : 'sello español'
 *              }
 *          }
 *
 *      }
 *
 * @param options - allows for extension without backwards compatibility issues or forward compatibility
 *  availible options include
 *      fallbackMethod : function (key, value, locale, fallback)
 *      detectorMethod : function (key, value)
 *      fallbackLocale : string
 *      decoratorMethod : function(object, key, value, locale, fallback),
 *      maxLoops : number (helps if object has cycle)
 *      report : boolean - whether to report fallbacks and such
 *
 * @returns {*}
 */
function arupex_i18n_map_resolver(options){
    if(!options){
        options = {};
    }

    var config = {
        locale : options.locale || 'en_US',
        fallbackMethod : options.fallbackMethod || function defaultFallback(key, value, locale, fallbackLocale){
            var split = locale.search(/-|_/);
            if(split > 0 && value[locale.substr(0, split)]){
                return value[locale.substr(0, split)];
            }
            return value[fallbackLocale];
        },
        detectorMethod : options.detectorMethod || function defaultDetector(key, value){
            return typeof value.en_US === 'string';
        },
        fallbackLocale : options.fallbackLocale || 'en_US',
        decoratorMethod : options.decoratorMethod || function defaultDecorator(object, key, value, locale, fallback){
            object[key] = value;
        },
        maxLoops : options.maxLoops || 5,
        report : options.report
    };



    return function resolver(object, locale){
        if(!object){
            return;
        }
        var report = {
            fallbacks : {}
        };

        function resolveObject(anObject){

            var state = [
                {
                    object : anObject,
                    keys : Object.keys(anObject)
                }
            ];
            var loops = 0;//per object

            while(state.length > 0 && loops < config.maxLoops){
                var current = state.shift();
                const currentObj = current.object;
                const currentKeys = current.keys;

                if(Array.isArray(currentKeys)){

                    currentKeys.forEach(function(aKey){
                        var value = currentObj[aKey];

                        if(config.detectorMethod(aKey, value)){

                            var localizedString = '';
                            const useLocale = locale || config.locale;

                            if(value[useLocale]){
                                localizedString = value[useLocale]
                            }
                            else{
                                localizedString = config.fallbackMethod(aKey, value, useLocale, config.fallbackLocale);
                                if(config.report){
                                    report.fallbacks[aKey + ':' + localizedString] = value;
                                }
                            }

                            config.decoratorMethod(currentObj, aKey, localizedString, useLocale, config.fallbackLocale);
                        }
                        else if(Array.isArray(value)){
                            resolveArray(value);
                        }
                        else if(value && typeof value === 'object'){

                            state.push({
                                object : value,
                                keys : Object.keys(value)
                            });
                            loops++;
                        }
                    });
                }
            }
            return config.report?{
                result : object,
                report : report
            }:object;
        }

        function resolveArray(array){
            array.forEach(function(element){
                resolveObject(element);
            });
            return array;
        }

        if(Array.isArray(object)){
            return resolveArray(object);
        }

        return resolveObject(object);
    };
}

if(typeof module !== 'undefined'){
    module.exports = arupex_i18n_map_resolver;
}