/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Factories
 */
(function($, pm) {

    /**
     * Displaying error messages and handling wait screen
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
        var waitScreen;
        var errorPopup = null;
        console.log( !!errorPopup );
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

            // create error-popup if not exist
            if( !errorPopup || $('body').has(errorPopup ).length <= 0 ) {
                errorPopup = $( pm.compileTemplate('error/errorPopup.html') );
                $('body').append( errorPopup );
                pm.partials.Error.init( errorPopup );
            }

            $.each(errorMessages, function(key, error) {
                // add additional error, if not exist.
                pm.partials.Error.addError( errorPopup, $(pm.compileTemplate('error/errorMessage.html', error)) );
            });

            pm.partials.Error.show( errorPopup );

            hideWaitScreen(true);
        }


        /**
         * Show wait screen if not visible and increase
         * {{#crossLink "UIFactory/waitScreenCount:attribute"}}waitScreenCount{{/crossLink}}
         * @function showWaitScreen
         */
        function showWaitScreen() {
            waitScreenCount = waitScreenCount || 0;

            // create wait-overlay if not exist
            if( !waitScreen || $('body').has(waitScreen ).length <= 0 ) {
                waitScreen = $( pm.compileTemplate('waitscreen/waitscreen.html') );
                pm.partials.WaitScreen.init( waitScreen );
            }

            pm.partials.WaitScreen.show( waitScreen );

            // increase instance counter to avoid showing multiple overlays
            waitScreenCount++;
            return waitScreenCount;
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
                pm.partials.WaitScreen.hide( waitScreen );
            }
            return waitScreenCount;
        }

    });
}(jQuery, PlentyFramework));