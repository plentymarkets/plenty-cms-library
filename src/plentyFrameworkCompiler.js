PlentyFramework.compile();

// Create global instance of PlentyFramework for usage in Webshop-Layouts
var plenty = PlentyFramework.getInstance();

// initially bind all registered directives
jQuery(document).ready(function() {
    plenty.bindDirectives();
});