(function($) {

    /**
     * Framework providing client functions for plentymarkets Webshops.
     * @constructor
     */
    PlentyFramework = function() {};

    var instance = null;
    PlentyFramework.getInstance = function() {
        instance = instance || new PlentyFramework();
        return instance;
    };

    /**
     * @type {Array} Collection of registered directives
     */
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

            var elements = [];
            // filter elements already bound
            $(directive.selector).each(function(j, obj) {
                if( $.inArray( $(obj)[0], directive.elements ) < 0 ) {
                    elements.push( $(obj) );
                }
            });
            if( !directiveSelector || directiveSelector === directive.selector || $.inArray(directive.selector, directiveSelector ) >= 0 ) {
                $.each( elements, function(i, elem) {
                    var params = [i, elem];

                    // append dependencies if exists
                    if( !!directive.dependencies && directive.dependencies.length > 0 ) {
                        $.each( directive.dependencies, function(j, dependency) {
                            var service = PlentyFramework.service(dependency);
                            if( !service ) {
                                console.error('Cannot inject service "' + dependency + "': Service not found.");
                            }
                            params.push( service );
                        });
                    }

                    // apply loop variables and dependend services to callback

                    directive.callback.apply(null, params);
                });
            }

            $(elements).each(function(j, obj) {
                // store function ID to avoid duplicate bindings
                if( !directive.allowDuplicates ) {
                    directive.elements.push( $(obj)[0] );
                }
            });
        });
    };

    PlentyFramework.service = function( serviceName, serviceFunctions ) {


        // Catch type mismatching for 'serviceName'
        if( typeof serviceName !== 'string' ) {
            console.error("Type mismatch: Expect first parameter to be a 'string', '" + typeof serviceFunctions + "' given.");
            return;
        }

        // getting services
        if( typeof serviceFunctions === 'undefined' ) {
            return PlentyFramework.prototype[serviceName];
        }

        // Catch type mismatching for 'serviceFunctions'
        if( typeof serviceFunctions !== 'function' ) {
            console.error("Type mismatch: Expect second parameter to be a 'function', '" + typeof serviceFunctions + "' given.");
            return;
        }

        // Avoid overriding existing services
        if( PlentyFramework.prototype.hasOwnProperty( serviceName ) ) {
            console.error("Service '" + serviceName + "' already exists.");
            return;
        }

        // inject service
        PlentyFramework.prototype[serviceName] = serviceFunctions();

    };

}(jQuery));

// Create global instance of PlentyFramework for usage in Webshop-Layouts
var pm = PlentyFramework.getInstance();

// initially bind all registered directives
jQuery(document).ready(function() {
    pm.bindDirectives();
});



