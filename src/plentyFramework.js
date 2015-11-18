/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module PlentyFramework
 */
(function($) {

    /**
     * Framework providing client functions for plentymarkets Webshops.
     * @class PlentyFramework
     * @constructor
     */
    PlentyFramework = function() {};

    var instance = null;
    PlentyFramework.getInstance = function() {
        instance = instance || new PlentyFramework();
        return instance;
    };

    /**
     * Customizable controls for partials will be injected here.
     * (e.g. Modal)
     * @attribute
     * @static
     * @type {object}
     */
    PlentyFramework.partials = {};

    /**
     * Collection of registered global variables
     * @attribute
     * @static
     * @type {object}
     */
    PlentyFramework.globals = {};

    /**
     * Set a global variable.
     * @function setGlobal
     * @static
     * @param {string}  identifier  A unique identifier to reference this variable
     * @param {*}       value       The value to set
     * @return {*}                  The value
     */
    PlentyFramework.setGlobal = function( identifier, value ) {
        if( PlentyFramework.globals.hasOwnProperty( identifier ) ) {
            console.error('Global variable "' + identifier + '" already exists and cannot be overridden.');
            return null;
        }

        PlentyFramework.globals[identifier] = value;

        return PlentyFramework.globals[identifier];
    };

    /**
     * Get the value of a global variable or undefined if not exists
     * @function getGlobal
     * @static
     * @param  identifier  The identifier of the requested variable
     * @return {*}         The value of the variable
     */
    PlentyFramework.getGlobal = function( identifier ) {
        return PlentyFramework.globals[identifier];
    };

    /**
     * Collection of registered directives
     * @type {Array}
     * @static
     */
    PlentyFramework.directives = [];

    /**
     * Register directive. Directives can be bound to dynamically added nodes by calling pm.bindPlentyFunctions();
     * @function directive
     * @static
     * @param   {string}    selector        jQuery selector of the DOM-elements to bind the directive to
     * @param   {function}  callback        Function to add directives behaviour
     * @param   {Array}     dependencies    List of required services. Services will be passed to callback function
     * @param   {boolean}   allowDuplicates Defines if a directive can be bound to the same element multiple times
     * @return  {object}                    The created directive
     */
    PlentyFramework.directive = function(selector, callback, dependencies, allowDuplicates) {
        var directive = {
            id:			PlentyFramework.directives.length,
            selector:	selector,
            callback:	callback,
            dependencies: dependencies,
            allowDuplicates: !!allowDuplicates,
            elements:	[]
        };
        PlentyFramework.directives.push(directive);

        return directive;
    };

    /**
     * Bind registered directives.
     * @function bindDirectives
     * @param {string} [directiveSelector] restrict binding to elements matching this selector
     */
    PlentyFramework.prototype.bindDirectives = function( directiveSelector ) {

        $.each( PlentyFramework.directives, function(i, directive)  {
            if( !directiveSelector || directiveSelector === directive.selector ) {
                var elements = [];
                // filter elements already bound
                $(directive.selector).each(function (j, obj) {
                    if ($.inArray(obj, directive.elements) < 0) {
                        elements.push(obj);
                    }
                });

                $.each(elements, function (i, elem) {
                    var params = [i, elem];

                    // append dependencies if exists
                    if (!!directive.dependencies && directive.dependencies.length > 0) {
                        params = params.concat(PlentyFramework.resolveServices(directive.dependencies));
                    }

                    // apply loop variables and depending services to callback
                    directive.callback.apply(null, params);
                });

                $(elements).each(function (j, obj) {
                    // store function ID to avoid duplicate bindings
                    if (!directive.allowDuplicates) {
                        directive.elements.push(obj);
                    }
                });
            }

        });
    };


    /**
     * Collection of uncompiled registered factories & services.
     * See {{#crossLink "PlentyFramework/compile:method"}}.compile(){{/crossLink}}
     * @attribute components
     * @static
     * @type {{factories: {}, services: {}}}
     */
    PlentyFramework.components = {
        factories: {},
        services: {}
    };

    /**
     * Register a new service
     * @function service
     * @static
     * @param {string}      serviceName        Unique identifier of the service to get/ create
     * @param {function}    serviceFunctions   Callback containing all public functions of this service.
     * @param {Array}       [dependencies]     Identifiers of required services to inject in serviceFunctions
     * @return {object}                        The object described in serviceFunctions(). Can be received via PlentyFramework.[serviceName]
     */
    PlentyFramework.service = function( serviceName, serviceFunctions, dependencies ) {

        // Catch type mismatching for 'serviceName'
        if( typeof serviceName !== 'string' ) {
            console.error("Type mismatch: Expect first parameter to be a 'string', '" + typeof serviceName + "' given.");
            return;
        }

        // Catch type mismatching for 'serviceFunctions'
        if( typeof serviceFunctions !== 'function' ) {
            console.error("Type mismatch: Expect second parameter to be a 'function', '" + typeof serviceFunctions + "' given.");
            return;
        }

        dependencies = dependencies || [];

        PlentyFramework.components.services[serviceName] = {
            name: serviceName,
            dependencies: dependencies,
            compile: function() {
                var params = PlentyFramework.resolveFactories( dependencies );
                PlentyFramework.prototype[serviceName] = serviceFunctions.apply( null, params );
            }
        };

    };

    /**
     * Returns an array containing required factories given by string identifier
     * @function resolveServices
     * @static
     * @private
     * @param  {Array} dependencies    Names of required factories
     * @return {Array}                 Objects to apply to callback function
     */
    PlentyFramework.resolveServices = function( dependencies ) {
        var compiledServices = [];

        $.each( dependencies, function(j, dependency) {

            // factory not found: try to compile dependent factory first
            if( !PlentyFramework.prototype.hasOwnProperty(dependency) ) {
                if( PlentyFramework.components.services.hasOwnProperty(dependency) ) {
                    PlentyFramework.components.services[dependency].compile();
                } else {
                    console.error('Cannot inject Service "' + dependency + '": Service not found.');
                    return false;
                }
            }
            var service = PlentyFramework.prototype[dependency];
            compiledServices.push( service );
        });

        return compiledServices;
    };

    /**
     * Collection of compiled factories
     * @attribute factories
     * @static
     * @type {object}
     */
    PlentyFramework.factories = {};

    /**
     * Register a new factory
     * @function factory
     * @static
     * @param {string}      factoryName         A unique name of the new factory
     * @param {function}    factoryFunctions    The function describing the factory
     * @param {Array}       dependencies        List of required factories to inject
     */
    PlentyFramework.factory = function( factoryName, factoryFunctions, dependencies ) {

        // Catch type mismatching for 'serviceName'
        if( typeof factoryName !== 'string' ) {
            console.error("Type mismatch: Expect first parameter to be a 'string', '" + typeof factoryName + "' given.");
            return;
        }

        // Catch type mismatching for 'serviceFunctions'
        if( typeof factoryFunctions !== 'function' ) {
            console.error("Type mismatch: Expect second parameter to be a 'function', '" + typeof factoryFunctions + "' given.");
            return;
        }

        dependencies = dependencies || [];
        PlentyFramework.components.factories[factoryName] = {
            name: factoryName,
            dependencies: dependencies,
            compile: function() {
                var params = PlentyFramework.resolveFactories( dependencies );
                PlentyFramework.factories[factoryName] = factoryFunctions.apply( null, params );
            }
        };

    };

    /**
     * Returns an array containing required factories given by string identifier
     * @function resolveFactories
     * @static
     * @private
     * @param  {Array}   dependencies  Names of required factories
     * @return {Array}                 Objects to apply to callback function
     */
    PlentyFramework.resolveFactories = function( dependencies ) {
        var compiledFactories = [];

        $.each( dependencies, function(j, dependency) {

            // factory not found: try to compile dependent factory first
            if( !PlentyFramework.factories.hasOwnProperty(dependency) ) {
                if( PlentyFramework.components.factories.hasOwnProperty(dependency) ) {
                    PlentyFramework.components.factories[dependency].compile();
                } else {
                    console.error('Cannot inject Factory "' + dependency + '": Factory not found.');
                    return false;
                }
            }
            var factory = PlentyFramework.factories[dependency];
            compiledFactories.push( factory );
        });

        return compiledFactories;
    };

    /**
     * Renders html template. Will provide given data to templates scope.
     * Uses <a href="https://github.com/janl/mustache.js/" target="_blank">Mustache syntax</a> for data-binding.
     * @function compileTemplate
     * @static
     * @param {String} template relative path to partials template to load. Base path = '/src/partials/'
     * @param {Object} data     data to privide to templates scope.
     * @returns {String}        The rendered html string
     */
    PlentyFramework.compileTemplate = function( template, data ) {
        data = data || {};
        data.translate = function() {
            return function( text, render ) {
                return render( PlentyFramework.translate(text) );
            };
        };
        return Mustache.render( TemplateCache[template], data );
    };

    /**
     * The path on the server where the script is located in.
     * @attribute
     * @static
     * @type {String}
     */
    PlentyFramework.scriptPath = '';

    /**
     * Collection of locale strings will be injected here after reading language file.
     * @attribute
     * @static
     * @type {Object}
     */
    PlentyFramework.Strings = {};

    /**
     * Load language file containing translations of locale strings.
     * @function loadLanguageFile
     * @static
     * @param fileName  relative path to language file.
     */
    PlentyFramework.loadLanguageFile = function( fileName ) {
        $.get( PlentyFramework.scriptPath + fileName ).done(function(response) {
            PlentyFramework.Strings = response;
        });
    };

    /**
     * Try to get locale translation of given string.
     * Render translated string using <a href="https://github.com/janl/mustache.js/" target="_blank">Mustache syntax</a>
     * if additional parameters are given.
     * @function translate
     * @static
     * @param {String} string   The string to translate
     * @param {Object} [params] additional data for rendering
     * @returns {String}        The translation of the given string if found. Otherwise returns the original string.
     */
    PlentyFramework.translate = function( string, params ) {
        var localeString;
        if( PlentyFramework.Strings.hasOwnProperty(string) ) {
            localeString = PlentyFramework.Strings[string];
        } else {
            localeString = string;
            console.warn('No translation found for "' + localeString + '".');
        }

        if( !!params ) {
            localeString = Mustache.render( localeString, params );
        }

        return localeString;

    };

    /**
     * Compile registered factories & services
     * @function compile
     * @static
     */
    PlentyFramework.compile = function() {

        for( var factory in PlentyFramework.components.factories ) {
            if( !PlentyFramework.factories.hasOwnProperty(factory) ) {
                PlentyFramework.components.factories[factory].compile();
            }
        }

        for( var service in PlentyFramework.components.services ) {
            if( !PlentyFramework.prototype.hasOwnProperty(service) ) {
                PlentyFramework.components.services[service].compile();
            }
        }

        var scripts = document.getElementsByTagName( 'SCRIPT' );
        if( scripts.length > 0 ) {
            var script = scripts[ scripts.length - 1];
            if( !!script.src && script.src.length > 0 )
            {
                PlentyFramework.scriptPath = script.src.match( /(.*)\/(.*)\.js(\?\S*)?$/ )[1];
            }
        }

    };

}(jQuery));



