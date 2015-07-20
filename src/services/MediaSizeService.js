/**
 * Licensed under AGBL v3
 * (https://github.com/plentymarkets/plentymarketsCMStools/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function($, pm){

    /**
     * Listens to window's size and trigger 'sizeChange' event if the Bootstrap interval changes.
     * @class MediaSizeService
     * @static
     * @example
     *      $(window).on('sizeChange', function(newValue, oldValue) {
     *          console.log('The interval changed from ' + oldValue + ' to ' + newValue.');
     *      });
     */
    pm.service('MediaSizeService', function() {

        var bsInterval;

        // recalculation of the current interval on window resize
        $(window).resize( calculateMediaSize );

        // initially calculation of the interval
        $(document).ready( calculateMediaSize );

        return {
            interval: getInterval
        };

        /**
         * Get the currently used Bootstrap interval
         * @function getInterval
         * @return {"xs"|"sm"|"md"|"lg"}
         */
        function getInterval() {
            if( !!bsInterval ) calculateMediaSize();

            return bsInterval;
        }

        /**
         * Calculate the currently used Bootstrap interval
         * @function calculateMediaSize
         * @private
         */
        function calculateMediaSize() {
            var size;
            if( !!window.matchMedia ) { // FIX IE support
                if( window.matchMedia('(min-width:1200px)').matches ) size = 'lg';
                else if( window.matchMedia('(min-width:992px)').matches ) size = 'md';
                else if( window.matchMedia('(min-width:768px)').matches ) size = 'sm';
                else size = 'xs';
            } else {
                if( $(window).width() >= 1200 ) size = 'lg';
                else if( $(window).width() >= 992 ) size = 'md';
                else if( $(window).width() >= 768 ) size = 'sm';
                else size = 'xs';
            }
            if( size != bsInterval ) {
                var oldValue = bsInterval;
                bsInterval = size;
                $(window).trigger('sizeChange', [bsInterval, oldValue]);
            }
        }


    });

}(jQuery, PlentyFramework));