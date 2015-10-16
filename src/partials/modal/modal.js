(function($, pm) {

    pm.partials.Modal = {
        init: function ( element, modal ) {
            element.on( 'hidden.bs.modal', function () {
                modal.hide();
                element.remove();
            });

            if ( modal.timeout > 0 ) {
                element.on( 'hide.bs.modal', modal.stopTimeout );
                element.find( '.modal-content' ).hover( function() {
                    modal.pauseTimeout();
                }, function () {
                    if ( element.is( '.in' ) ) {
                        modal.continueTimeout();
                    }
                });
            }
        },

        show: function ( element ) {
            element.modal( 'show' );
        },

        hide: function ( element ) {
            element.modal( 'hide' );
        },

        isModal: function ( html ) {
            return $( html ).filter( '.modal' ).length + $( html ).find( '.modal' ).length > 0;
        },

        getModal: function ( html ) {
            var modal = $( html );
            if ( modal.length > 1 ) {
                modal = $( html ).filter( '.modal' ) || $( html ).find( '.modal' );
            }

            return modal;
        }
    };

}(jQuery, PlentyFramework));