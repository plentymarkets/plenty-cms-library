(function($, pm) {

    /**
     * Displaying error messages and handling wait screen
     * @module Factories
     * @class UIFactory
     * @static
     */
    pm.factory('UIFactory', function() {
        /**
         * Increased/ decreased when showing/ hiding wait screen to avoid stacking
         * multiple instances of overlays.
         * @attribute waitScreenCount
         * @private
         * @type {number}
         * @default 0
         */
        var waitScreenCount = 0;

        return {
            throwError: throwError,
            printErrors: printErrors,
            showWaitScreen: showWaitScreen,
            hideWaitScreen: hideWaitScreen
        };

        /**
         * Display a single error message.
         * @function throwError
         * @param {number} code A code identifying this error
         * @param {string} msg  The error message to display
         */
        function throwError(code, msg) {
            printErrors([{code: code, message: msg}]);
        }

        /**
         * Wrap error messages in error popup, if popup doesn't already contain this error
         * If popup is already visible, append new errors to popup's inner HTML
         * otherwise create new popup
         * @function printErrors
         * @param {Array} errorMessages A list of errors to display
         */

        function printErrors(errorMessages) {
            var popup = $('#CheckoutErrorPane');
            var errorHtml = '';

            // create error-popup if not exist
            if( popup.length <= 0 ) {
                popup = $('<div class="plentyErrorBox" id="CheckoutErrorPane" style="display: none;"><button class="close" type="button"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button><div class="plentyErrorBoxInner"></div></div>');

                $('body').append(popup);
                // bind popups 'close'-button
                popup.find('.close').click(function() {
                    popup.hide();
                });
            }

            $.each(errorMessages, function(key, error) {
                // add additional error, if not exist.
                if( !popup.is(':visible') || popup.find('[data-plenty-error-code="'+error.code+'"]').length <= 0 ) {
                    errorHtml += '\
					<div class="plentyErrorBoxContent" data-plenty-error-code="'+error.code+'">\
						<span class="PlentyErrorCode">Code '+error.code+':</span>\
						<span class="PlentyErrorMsg">'+error.message+'</span>\
					</div>';
                }
            });

            if( popup.is(':visible') ) {
                // append new error to existing errors, if popup is already visible
                popup.find('.plentyErrorBoxInner').append(errorHtml);
            } else {
                // replace generated error-HTML and show popup
                popup.find('.plentyErrorBoxInner').html(errorHtml);
                popup.show();
            }

            hideWaitScreen(true);
        }


        /**
         * Show wait screen if not visible and increase
         * {{#crossLink "UIFactory/waitScreenCount:attribute"}}waitScreenCount{{/crossLink}}
         * @function showWaitScreen
         */
        function showWaitScreen() {
            waitScreenCount = waitScreenCount || 0;
            var waitScreen = $('#PlentyWaitScreen');
            // create wait-overlay if not exist
            if( waitScreen.length <= 0 ) {
                waitScreen = $('<div id="PlentyWaitScreen" class="overlay overlay-wait"></div>');
                $('body').append(waitScreen);
            }

            // show wait screen if not already visible
            if( !waitScreen.is('.in') ) {
                waitScreen.addClass('in');
            }

            // increase instance counter to avoid showing multiple overlays
            waitScreenCount++;
        }

        /**
         * Decrease {{#crossLink "UIFactory/waitScreenCount:attribute"}}waitScreenCount{{/crossLink}}
         * and hide wait screen if waitScreenCount is 0
         * @function hideWaitScreen
         * @param {boolean} forceClose set true to hide wait screen independent from the value of waitScreenCount.
         */
        function hideWaitScreen( forceClose ) {

            // decrease overlay count
            waitScreenCount--;
            // hide if all instances of overlays has been closed
            // or if closing is forced by user
            if( waitScreenCount <= 0 || !!forceClose ) {
                waitScreenCount = 0;
                $('#PlentyWaitScreen').removeClass('in');
            }
        }

    });
}(jQuery, PlentyFramework));