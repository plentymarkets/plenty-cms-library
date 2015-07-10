(function($) {

    /**
     * Framework providing client functions for plentymarkets Webshops.
     */
    PlentyFramework = function() {};

    var instance = null;
    PlentyFramework.getInstance = function() {
        instance = instance || new PlentyFramework();
        return instance;
    };

    PlentyFramework.directives = [];

    /**
     * Register directive. Directives can be bound to dynamically added nodes by calling pm.bindPlentyFunctions();
     * @param   {string}    selector        jQuery selector of the DOM-elements to bind the directive to
     * @param   {function}  callback        Function to add directives behaviour
     * @param   {Array}     dependencies    List of required services. Services will be passed to callback function
     * @param   {boolean}   allowDuplicates Defines if a directive can be bound to the same element multiple times
     * @returns {object}                    The created directive
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
     * @param {string} [directiveSelector] restrict binding to elements matching this selector
     */
    PlentyFramework.prototype.bindDirectives = function( directiveSelector ) {

        $.each( PlentyFramework.directives, function(i, directive)  {
            if( !directiveSelector || directiveSelector === directive.selector ) {
                var elements = [];
                // filter elements already bound
                $(directive.selector).each(function (j, obj) {
                    // console.log( obj, $(obj)[0], directive.elements);
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


    PlentyFramework.components = {
        factories: {},
        services: {}
    };

    /**
     * Register a new service
     * @param {string}      serviceName         Unique identifier of the service to get/ create
     * @param {function}    serviceFunctions  Callback containing all public functions of this service.
     * @param {Array}       [dependencies]      Identifiers of required services to inject in serviceFunctions
     * @returns {object}                        The object described in serviceFunctions(). Can be received via PlentyFramework.[serviceName]
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
     * @param {Array}   dependencies    Names of required factories
     * @returns {Array}                 Objects to apply to callback function
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
                }
            }

            var service = PlentyFramework.prototype[dependency];
            compiledServices.push( service );
        });

        return compiledServices;
    };

    PlentyFramework.factories = {};
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
     * @param {Array}   dependencies    Names of required factories
     * @returns {Array}                 Objects to apply to callback function
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
                }
            }

            var factory = PlentyFramework.factories[dependency];
            compiledFactories.push( factory );
        });

        return compiledFactories;
    };


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

    };

}(jQuery));



