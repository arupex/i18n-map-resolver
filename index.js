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
'use strict';

class ArupexI18nMapResolver {

    constructor(options){
        if (!options) {
            options = {};
        }

        if (typeof arupex_deep_value !== 'function') {
            this.deep = require('deep-value');
        }
        else {
            this.deep = arupex_deep_value;
        }

        this.locale = (typeof options.locale === 'string') ? options.locale : 'en_US';
        this.localeKey = (typeof options.locale === 'object') ? options.locale.propertyString : false;
        this.fallbackLocale  = options.fallbackLocale  || 'en_US';
        this.returnWhenEmpty = options.returnWhenEmpty || false;

        const isString = (value) => typeof value === 'string';

        const defaultDecorator = (object, key, value, locale, fallback) => {
            object[key] = value;
        };
        const defaultDetector = (key, value, fullObject) => {
            let defaultLocale = this.localeKey?this.deep(fullObject, this.localeKey):this.locale;
            if(typeof value === 'object') {
                if(isString(value[defaultLocale]) ||
                    isString(value[this.fallbackLocale]) ||
                    isString(value.en_US) ){//may remove this hardcode in the future
                    return true;
                }
            }
            return false;
        };

        const defaultFallback = (key, value, locale, fallbackLocale) => {
            if(typeof locale === 'string') {
                let split = locale.search(/-|_/);
                let s = locale.substr(0, split);
                if (split > 0 && isString(s) && isString(value[s]) && (this.returnWhenEmpty || value[s].length > 0)) {
                    return value[s];
                }
            }
            if(typeof value[fallbackLocale] === 'string'  && (this.returnWhenEmpty || value[fallbackLocale].length > 0)) {
                return value[fallbackLocale];
            }
            let firstLocale = Object.keys(value).find((key) => {
                return isString(key) && isString(value[key]) && (this.returnWhenEmpty || value[key].length > 0);
            });
            return firstLocale ? value[firstLocale]: '';//cant find a good string
        };

        this.fallbackMethod  = options.fallbackMethod  || defaultFallback;
        this.detectorMethod  = options.detectorMethod  ||  defaultDetector;
        this.decoratorMethod = options.decoratorMethod || defaultDecorator;

        this.maxDepth = options.maxDepth || 5;
        this.report = options.report;
    }


    resolve (object, overrideLocale) {
        if(!object || typeof object !== 'object'){
            return;
        }

        if(this.detectorMethod('', object, object)) {
            let report = {};
            let result = this.localize(object, overrideLocale || this.locale, '', report);
            return this.report?{
                result : result,
                report : report
            }:result;
        }


        if(Array.isArray(object)){
            return this.resolveArray(object, overrideLocale);
        }

        return this.resolveObject(object, overrideLocale);
    }


    resolveArray(array, overrideLocale){
        array.forEach((element) => {
            this.resolveObject(element, overrideLocale);
        });
        return array;
    }

    resolveObject(anObject, overrideLocale){

        let report = {
            fallbacks : {}
        };

        let state = [
            {
                object : anObject,
                keys : Object.keys(anObject),
                depth : 0
            }
        ];

        while(state.length > 0){
            let current = state.shift();
            if((current.depth < this.maxDepth)) {
                const currentObj = current.object;
                const currentKeys = current.keys;

                if (Array.isArray(currentKeys)) {

                    currentKeys.forEach((aKey) => {
                        let value = currentObj[aKey];

                        if (this.detectorMethod(aKey, value, anObject)) {

                            const useLocale = overrideLocale || (this.localeKey ? this.deep(anObject, this.localeKey) : this.locale);
                            let localizedString = this.localize(value, useLocale, aKey, report);

                            this.decoratorMethod(currentObj, aKey, localizedString, useLocale, this.fallbackLocale);
                        }
                        else if (Array.isArray(value)) {
                            this.resolveArray(value);
                        }
                        else if (value && typeof value === 'object') {

                            state.push({
                                object: value,
                                keys: Object.keys(value),
                                depth: current.depth + 1
                            });
                        }
                    });

                }
            }
        }
        return this.report?{
            result : anObject,
            report : report
        }:anObject;
    }

    localize(value, useLocale, aKey, report) {
        let localizedString = '';
        if (typeof value[useLocale] === 'string' && (this.returnWhenEmpty || value[useLocale].length > 0)) {
            localizedString = value[useLocale];
        }
        else {
            localizedString = this.fallbackMethod(aKey, value, useLocale, this.fallbackLocale);
            if (this.report && typeof report === 'object') {
                report.fallbacks[aKey + ':' + localizedString] = value;
            }
        }
        return localizedString;
    }
}

if(typeof module !== 'undefined'){
    module.exports = ArupexI18nMapResolver;
}