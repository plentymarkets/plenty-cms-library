(function($, pm) {

    pm.partials.WaitScreen = {

        init: function( element ) {
            $('body').append( element );
        },

        show: function( element ) {
            element.addClass('in');
        },

        hide: function( element ) {
            element.removeClass('in');
        }

    };

})(jQuery, PlentyFramework);