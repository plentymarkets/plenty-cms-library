(function($, pm) {

    pm.factory('UIFactory', function() {

        return {
            throwError: throwError,
            printErrors: printErrors,
            showWaitScreen: showWaitScreen,
            hideWaitScreen: hideWaitScreen
        };

        function throwError(code, msg) {
            printErrors([{code: code, message: msg}]);
        }

        /**
         * Wrap error messages in error popup, if popup doesn't already contain this error
         * If popup is already visible, append new errors to popup's inner HTML
         * otherwise create new popup
         *
         * @param errorMessages - Array of error messages objects. example: [{code: 400, message: "something didn't work as it should!"}]
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
         * Wait-Screen
         * Show or hide wait screen
         */
        var waitScreenCount = 0;
        function showWaitScreen() {
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