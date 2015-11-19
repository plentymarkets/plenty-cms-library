(function($, pm) {

    pm.partials.Modal = {


        /**
         * Will be called after a new modal was created and injected into DOM
         * @param {HTMLElement} element The injected modal element
         * @param {Modal} modal         The instance of the current modal
         */
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

        /**
         * Will be called if a Modal requests to show.
         * @param {HTMLElement} element The injected modal element
         */
        show: function ( element ) {
            element.modal( 'show' );
        },

        /**
         * Will be called if a Modal requests to hide.
         * @param {HTMLElement} element The injected modal element
         */
        hide: function ( element ) {
            element.modal( 'hide' );
        },

        /**
         * Detect if a given HTML string contains a modal
         * @param {HTMLElement} html the element to search a modal in.
         * @returns {boolean}   true if a modal was found
         */
        isModal: function ( html ) {
            return $( html ).filter( '.modal' ).length + $( html ).find( '.modal' ).length > 0;
        },

        /**
         * Filter a modal from a given HTML string
         * @param {HTMLElement}     html the element to get a modal from.
         * @returns {HTMLElement}   the filtered modal element
         */
        getModal: function ( html ) {
            var modal = $( html );
            if ( modal.length > 1 ) {
                modal = $( html ).filter( '.modal' ) || $( html ).find( '.modal' );
            }

            return modal;
        }

    };

}(jQuery, PlentyFramework));