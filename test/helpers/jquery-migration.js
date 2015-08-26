(function () {
    var rsingleTag;

    if (typeof jQuery !== 'undefined' && !jQuery.parseHTML) {
        /*!
         * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
         * Released under the MIT license
         * http://jquery.org/license
         *
         */

        rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;


        // data: string of html
        // context (optional): If specified, the fragment will be created in this context,
        // defaults to document
        // keepScripts (optional): If true, will include scripts passed in the html string
        jQuery.parseHTML = function (data, context, keepScripts) {
            if (!data || typeof data !== "string") {
                return null;
            }
            if (typeof context === "boolean") {
                keepScripts = context;
                context = false;
            }
            context = context || document;

            var parsed = rsingleTag.exec(data),
                scripts = !keepScripts && [];

            // Single tag
            if (parsed) {
                return [context.createElement(parsed[1])];
            }

            parsed = jQuery.buildFragment([data], [context], scripts);

            if (scripts && scripts.length) {
                jQuery(scripts).remove();
            }

            return jQuery.merge([], parsed.fragment.childNodes);
        };

        return jQuery.parseHTML;
    }
})();