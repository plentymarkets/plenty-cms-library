(function( $, pm )
{

    pm.partials.Error = {

        /**
         * Will be called, after the error popup was created and injected in DOM.
         * @param {HTMLElement} popup   The injected element of the popup
         */
        init: function( popup )
        {
            $( popup ).find( '.close' ).click( function()
            {
                popup.hide();
                popup.find( '.plentyErrorBoxInner' ).html( '' );
            } );
        },

        /**
         * Will be called for each thrown error. Has to be injected in DOM manually.
         * @param {HTMLElement} popup   The error popup element
         * @param {HTMLElement} error   The error message element
         */
        addError: function( popup, error )
        {
            var errorCode = $( error ).attr( 'data-plenty-error-code' );

            if ( $( popup ).find( '[data-plenty-error-code="' + errorCode + '"]' ).length <= 0 )
            {
                $( popup ).find( '.plentyErrorBoxInner' ).append( error );
            }
        },

        /**
         * Will be called, after initialization and injection of all errors
         * @param {HTMLElement} popup The error popup element
         */
        show: function( popup )
        {
            $( popup ).show();
        }

    }

})( jQuery, PlentyFramework );