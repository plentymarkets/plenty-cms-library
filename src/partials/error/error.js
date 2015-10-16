(function($, pm) {

    pm.partials.Error = {

        init: function( popup ) {
            $(popup).find('.close').click(function() {
                popup.hide();
                popup.find('.plentyErrorBoxInner').html('');
            });
        },

        addError: function( popup, error ) {
            var errorCode = $(error).attr('data-plenty-error-code');

            if( $(popup).find('[data-plenty-error-code="'+errorCode+'"]').length <= 0 ) {
                $(popup ).find('.plentyErrorBoxInner').append( error );
            }
        },

        show: function( popup ) {
            $(popup).show();
        }

    }

})(jQuery, PlentyFramework);