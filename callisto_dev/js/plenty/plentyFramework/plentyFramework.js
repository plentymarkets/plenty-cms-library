(function($) {

    /**
     * Framework providing client functions for plentymarkets Webshops.
     * @constructor
     */
    PlentyFramework = function() {};

    /**
     * @type {Array} Collection of registered directives
     */
    PlentyFramework.directives = [];

    /**
     * Register directive. Directives can be bound to dynamically added nodes by calling pm.bindPlentyFunctions();
     * @param   {string}    selector        jQuery selector of the DOM-elements to bind the directive to
     * @param   {function}  callback        Function to add directives behaviour
     * @param   {boolean}   allowDuplicates Defines if a directive can be bound to the same element multiple times
     * @returns {object}                    The created directive
     */
    PlentyFramework.directive = function(selector, callback, allowDuplicates) {
        var directive = {
            id:			PlentyFramework.directives.length,
            selector:	selector,
            callback:	callback,
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
                $.each( elements, directive.callback );
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

        PlentyFramework.prototype[serviceName] = serviceFunctions();

    };

}(jQuery));

// Create global instance of PlentyFramework for usage in Webshop-Layouts
var pm = new PlentyFramework();

// initially bind all registered directives
jQuery(document).ready(function() {
    pm.bindDirectives();
});



