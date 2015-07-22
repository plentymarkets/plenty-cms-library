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
(function(pm) {

    /**
     * Holds checkout data for global access and provides methods
     * for reloading content dynamically-<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CMSFactory"}}CMSFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "UIFactory"}}UIFactory{{/crossLink}}</li>
     * </ul>
     * @class CheckoutFactory
     * @static
     */
	pm.factory('CheckoutFactory', function(API, CMS, UI) {

        // data received from ReST API
        var checkoutData;

        // instance wrapped checkout object for global access
        var checkout;

		return {
            getCheckout: getCheckout,
            setCheckout: setCheckout,
            loadCheckout: loadCheckout,
            reloadContainer: reloadContainer,
            reloadCatContent: reloadCatContent,
            reloadItemContainer: reloadItemContainer,
		};


        function Checkout() {
            return checkoutData;
        }

        /**
         * Returns instance of wrapped checkout object
         * @function getCheckout
         * @returns {Checkout} Instance of checkout object
         */
        function getCheckout() {
            if( !checkout ) {
                checkout = new Checkout();
            }

            return checkout;
        }

        /**
         * Receive global checkout data from ReST-API
         * @function loadCheckout
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function loadCheckout() {

            return API.get('/rest/checkout/')
                .done(function(response) {
                    if( !!response ) checkoutData = response.data;
                    else API.throwError(0, 'Could not receive checkout data [GET "/rest/checkout/" receives null value]');
                });
        }

        /**
         * Update checkout data on server
         * @function setCheckout
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function setCheckout() {

            return API.put('/rest/checkout', checkout)
                .done(function(response) {
                    if( !!response ) checkoutData = response.data;
                    else API.throwError(0, 'Could not receive checkout data [GET "/rest/checkout/" receives null value]');
                });

        }

        /**
         * Get layout container from server and replace received HTML
         * in containers marked with <b>data-plenty-checkout-template="..."</b>
         * @function reloadContainer
         * @param  {string} container Name of the template to load from server
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function reloadContainer( container ) {
            UI.showWaitScreen();
            return CMS.getContainer( "checkout"+container ).from( 'checkout' )
                .done(function (response) {
                    $('[data-plenty-checkout-template="' + container + '"]')
                        .each(function (i, elem) {
                            $(elem).html(response.data[0]);
                            pm.getInstance().bindDirectives();
                            UI.hideWaitScreen();
                        });
                });
        }

        /**
         * Get category content from server and replace received HTML
         * in containers marked with <b>data-plenty-checkout-catcontent="..."</b>
         * @function reloadCatContent
         * @param	{number} catId	ID of the category to load content (description 1) from server
         * @return  {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function reloadCatContent( catId ) {
            UI.showWaitScreen();
            return CMS.getCategoryContent(catId)
                .done(function(response) {
                    $('[data-plenty-checkout-catcontent="'+catId+'"]')
                        .each(function(i, elem) {
                            $(elem).html(response.data[0]);
                            pm.getInstance().bindDirectives();
                            UI.hideWaitScreen(true);
                        });
                });

        }

        /**
         * Get layout container from server and replace received HTML
         * in containers marked with <b>data-plenty-itemview-template="..."</b>
         * @function reloadItemContainer
         * @param	{string} container	Name of the (item view) template to load from server
         * @return  {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function reloadItemContainer( container ) {
            UI.showWaitScreen();
            return CMS.getContainer( 'itemview' + container ).from( 'itemview' )
                .done(function(response) {
                    $('[data-plenty-itemview-template="'+container+'"]')
                        .each(function(i, elem) {
                            $(elem).html(response.data[0]);
                            pm.getInstance().bindDirectives();
                            UI.hideWaitScreen();
                        });
                });

        }
				
	}, ['APIFactory', 'CMSFactory', 'UIFactory']);
}(PlentyFramework));