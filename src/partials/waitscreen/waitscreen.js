(function($, pm) {

    pm.partials.WaitScreen = {

        /**
         * Will be called if the wait screen should be shown
         * @param {HTMLElement} element The wait screen element
         */
        show: function( element ) {
            element.addClass('in');
        },

        /**
         * Will be called if the wait screen should be hidden
         * @param {HTMLElement} element The wait screen element
         */
        hide: function( element ) {
            element.removeClass('in');
        }

    };

})(jQuery, PlentyFramework);