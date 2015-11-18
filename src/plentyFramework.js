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
(function( $ )
{

    /**
     * Collection of uncompiled registered factories & services.
     * See {{#crossLink "PlentyFramework/compile:method"}}.compile(){{/crossLink}}
     * @attribute components
     * @static
     * @type {{factories: {}, services: {}}}
     */
    var components = {
        factories : {},
        services  : {},
        directives: {}
    };

    /**
     * Framework providing client functions for plentymarkets Webshops.
     * @class PlentyFramework
     * @constructor
     */
    PlentyFramework = function()
    {
    };

    var instance                = null;
    PlentyFramework.getInstance = function()
    {
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
    PlentyFramework.setGlobal = function( identifier, value )
    {
        if ( PlentyFramework.globals.hasOwnProperty( identifier ) )
        {
            console.error( 'Global variable "' + identifier + '" already exists and cannot be overridden.' );
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
    PlentyFramework.getGlobal = function( identifier )
    {
        return PlentyFramework.globals[identifier];
    };

    /**
     * Collection of registered directives
     * @type {Array}
     * @static
     */
    PlentyFramework.directives = {};

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
    PlentyFramework.directive = function( directiveName, directiveFunctions, dependencies )
    {
        // Catch type mismatching for 'directiveName'
        if ( typeof directiveName !== 'string' )
        {
            console.error( "Type mismatch: Expect first parameter to be a 'string', '" + typeof directiveName + "' given." );
            return;
        }

        // Catch type mismatching for 'serviceFunctions'
        if ( typeof directiveFunctions !== 'function' )
        {
            console.error( "Type mismatch: Expect second parameter to be a 'function', '" + typeof directiveFunctions + "' given." );
            return;
        }

        dependencies = dependencies || [];

        components.directives[directiveName] = {
            name        : directiveName,
            dependencies: dependencies,
            compile     : function()
            {
                var params                                = PlentyFramework.resolveServices( dependencies );
                PlentyFramework.directives[directiveName] = directiveFunctions.apply( null, params );
            }
        };
    };

    /**
     * Bind registered directives.
     * @function bindDirectives
     * @param {string} [directiveSelector] restrict binding to elements matching this selector
     */
    PlentyFramework.prototype.bindDirectives = function( rootElement )
    {

        rootElement = rootElement || 'body';

        $( rootElement ).find( '[data-plenty]' ).each( function( i, element )
        {

            var directives = parseDirectives( $( element ).attr( 'data-plenty' ), $( element ) );

            if( directives.length <= 0 ) {
                // continue
                return;
            }

            for(var i = 0; i < directives.length; i++ )
            {
                var directive = directives[i];
                if ( !!PlentyFramework.directives[directive.class] && PlentyFramework.directives.hasOwnProperty( directive.class ) )
                {

                    var callback = PlentyFramework.directives[directive.class][directive.method];
                    if ( !!callback && typeof callback == "function" )
                    {

                        if ( directive.event == "ready" )
                        {
                            callback.apply( null, injectEvent( directive.params, undefined ) );
                        }
                        else
                        {
                            bindEventCallback( $(element), directive.event, callback, directive.params );
                            /*
                            $( element ).on( directive.event, function( e )
                            {
                                directive = injectEvent( directive, e );
                                return callback.apply( null, directive.params );
                            } );
                            */
                        }

                    }
                    else
                    {
                        console.error( "Method not found: " + directive.method + " in " + directive.class );
                    }

                }
                else
                {
                    console.error( "Directive not found: " + directive.class );
                }
            }
        } );

        $(document).trigger('initPartials', rootElement );
    };

    function bindEventCallback( $elem, event, callback, params )
    {
        $elem.on( event, function(e) {
            return callback.apply( null, injectEvent(params, e) );
        });
    }

    function injectEvent( paramList, event )
    {
        for( var i = 0; i < paramList.length; i++ )
        {
            if( !!paramList[i].toLowerCase && (paramList[i].toLowerCase() == 'e' || paramList[i].toLowerCase() == 'event') )
            {
                paramList[i] = event;
            }
        }

        return paramList;
    }

    function parseDirectives( input, thisValue )
    {
        var directivePattern = /^(([\w]+):)?([\w]+)\.([\w]+)(\((.*)\))?$/;
        var expressions = input.split(';');
        var directives = [];

        for( var i = 0; i < expressions.length; i++ )
        {
            var expression = expressions[i].trim();

            if( !expression ) {
                continue;
            }

            if ( !directivePattern.test( expression ) )
            {
                console.warn( "Invalid directive: " + expression );
                continue;
            }

            var match = expression.match( directivePattern );

            if ( !match[3] || match[3].length <= 0 )
            {
                console.error( "Cannot parse '" + expression + "': Class name not set." );
                continue;
            }

            if ( !match[4] || match[4].length <= 0 )
            {
                console.error( "Cannot parse '" + expression + "': Method not set." );
                continue;
            }

            var directive = {
                event : match[2] || 'ready',
                class : match[3],
                method: match[4],
                params: []
            };

            if ( !!match[6] && match[6].length > 0 )
            {
                var params = match[6].match(/(['][\w\s,"-]+['])|([\w-]+)|(["][\w\s,'-]+["])/g);
                for ( var j = 0; j < params.length; j++ )
                {
                    var param = params[j].trim();
                    if ( !isNaN( parseFloat( param ) ) )
                    {
                        directive.params.push( parseFloat( param ) );
                    }
                    else if ( param.toLowerCase() == 'true' )
                    {
                        directive.params.push( true );
                    }
                    else if ( param.toLowerCase() == 'false' )
                    {
                        directive.params.push( false );
                    }
                    else if ( param.toLowerCase() == 'this' )
                    {
                        directive.params.push( thisValue );
                    }
                    else
                    {
                        directive.params.push( param.replace( /^['"]|['"]$/g, '' ) );
                    }
                }
            }

            directives.push( directive );

        }
        return directives;
    }

    /**
     * Register a new service
     * @function service
     * @static
     * @param {string}      serviceName        Unique identifier of the service to get/ create
     * @param {function}    serviceFunctions   Callback containing all public functions of this service.
     * @param {Array}       [dependencies]     Identifiers of required services to inject in serviceFunctions
     * @return {object}                        The object described in serviceFunctions(). Can be received via
     *     PlentyFramework.[serviceName]
     */
    PlentyFramework.service = function( serviceName, serviceFunctions, dependencies )
    {

        // Catch type mismatching for 'serviceName'
        if ( typeof serviceName !== 'string' )
        {
            console.error( "Type mismatch: Expect first parameter to be a 'string', '" + typeof serviceName + "' given." );
            return;
        }

        // Catch type mismatching for 'serviceFunctions'
        if ( typeof serviceFunctions !== 'function' )
        {
            console.error( "Type mismatch: Expect second parameter to be a 'function', '" + typeof serviceFunctions + "' given." );
            return;
        }

        dependencies = dependencies || [];

        components.services[serviceName] = {
            name        : serviceName,
            dependencies: dependencies,
            compile     : function()
            {
                var params                             = PlentyFramework.resolveFactories( dependencies );
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
    PlentyFramework.resolveServices = function( dependencies )
    {
        var compiledServices = [];

        $.each( dependencies, function( j, dependency )
        {

            // factory not found: try to compile dependent factory first
            if ( !PlentyFramework.prototype.hasOwnProperty( dependency ) )
            {
                if ( components.services.hasOwnProperty( dependency ) )
                {
                    components.services[dependency].compile();
                }
                else
                {
                    console.error( 'Cannot inject Service "' + dependency + '": Service not found.' );
                    return false;
                }
            }
            var service = PlentyFramework.prototype[dependency];
            compiledServices.push( service );
        } );

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
    PlentyFramework.factory = function( factoryName, factoryFunctions, dependencies )
    {

        // Catch type mismatching for 'serviceName'
        if ( typeof factoryName !== 'string' )
        {
            console.error( "Type mismatch: Expect first parameter to be a 'string', '" + typeof factoryName + "' given." );
            return;
        }

        // Catch type mismatching for 'serviceFunctions'
        if ( typeof factoryFunctions !== 'function' )
        {
            console.error( "Type mismatch: Expect second parameter to be a 'function', '" + typeof factoryFunctions + "' given." );
            return;
        }

        dependencies                      = dependencies || [];
        components.factories[factoryName] = {
            name        : factoryName,
            dependencies: dependencies,
            compile     : function()
            {
                var params                             = PlentyFramework.resolveFactories( dependencies );
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
    PlentyFramework.resolveFactories = function( dependencies )
    {
        var compiledFactories = [];

        $.each( dependencies, function( j, dependency )
        {

            // factory not found: try to compile dependent factory first
            if ( !PlentyFramework.factories.hasOwnProperty( dependency ) )
            {
                if ( components.factories.hasOwnProperty( dependency ) )
                {
                    components.factories[dependency].compile();
                }
                else
                {
                    console.error( 'Cannot inject Factory "' + dependency + '": Factory not found.' );
                    return false;
                }
            }
            var factory = PlentyFramework.factories[dependency];
            compiledFactories.push( factory );
        } );

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
    PlentyFramework.compileTemplate = function( template, data )
    {
        data           = data || {};
        data.translate = function()
        {
            return function( text, render )
            {
                return render( PlentyFramework.translate( text ) );
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
    PlentyFramework.loadLanguageFile = function( fileName )
    {
        $.get( PlentyFramework.scriptPath + fileName ).done( function( response )
        {
            PlentyFramework.Strings = response;
        } );
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
    PlentyFramework.translate = function( string, params )
    {
        var localeString;
        if ( PlentyFramework.Strings.hasOwnProperty( string ) )
        {
            localeString = PlentyFramework.Strings[string];
        }
        else
        {
            localeString = string;
            console.warn( 'No translation found for "' + localeString + '".' );
        }

        if ( !!params )
        {
            localeString = Mustache.render( localeString, params );
        }

        return localeString;

    };

    /**
     * Compile registered factories & services
     * @function compile
     * @static
     */
    PlentyFramework.compile = function()
    {

        for ( var factory in components.factories )
        {
            if ( !PlentyFramework.factories.hasOwnProperty( factory ) )
            {
                components.factories[factory].compile();
            }
        }

        for ( var service in components.services )
        {
            if ( !PlentyFramework.prototype.hasOwnProperty( service ) )
            {
                components.services[service].compile();
            }
        }

        for ( var directive in components.directives )
        {
            if ( !PlentyFramework.directives.hasOwnProperty( directive ) )
            {
                components.directives[directive].compile();
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

}( jQuery ));



