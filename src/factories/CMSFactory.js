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
(function( pm )
{

    /**
     * Provide methods for receiving layout containers, layout parameters
     * or category content from API<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     * </ul>
     * @class CMSFactory
     * @static
     */
    pm.factory( 'CMSFactory', function( API )
    {

        return {
            getContainer      : getContainer,
            reloadContainer   : reloadContainer,
            reloadItemContainer:reloadItemContainer,
            getParams         : getParams,
            getCategoryContent: getCategoryContent,
            reloadCatContent  : reloadCatContent
        };

        /**
         * Prepare the request to receive HTML-Content from CMS
         * @function getContainer
         * @param   {string}    containerName The Layoutcontainer to receive.
         * @param   {object}    params Additional GET-parameters.
         * @returns {object}    The prepared request. Call <code>.from( layoutGroup )</code> to specify the location in
         *     the CMS
         *                      (e.g. 'Checkout')
         * @example
         *          CMSFactory.getContainer( 'CheckoutTotals' ).from( 'Checkout' )
         *              .done(function( response ) {
         *                  // container content
         *                  var html = response.data[0]
         *              });
         */
        function getContainer( containerName, params )
        {

            function from( layoutGroup )
            {
                return API.get( '/rest/' + layoutGroup.toLowerCase() + '/container_' + containerName.toLowerCase() + '/', params );
            }

            return {
                from: from
            }

        }

        /**
         * Get layout container from server and replace received HTML
         * in containers marked with <b>data-plenty-checkout-template="..."</b>
         * @function reloadContainer
         * @param  {string} container Name of the template to load from server
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function reloadContainer( container )
        {
            if( $( '[data-plenty-checkout-template="' + container + '"]' ).length > 0 )
            {
                return getContainer( "checkout" + container ).from( 'checkout' )
                    .done( function( response )
                    {
                        $( '[data-plenty-checkout-template="' + container + '"]' )
                            .each( function( i, elem )
                            {
                                $( elem ).html( response.data[0] );
                                pm.getInstance().bindDirectives( elem );
                                $( window ).trigger( 'contentChanged' );
                            } );
                    } );
            }
            else
            {
                return API.idle();
            }
        }

        /**
         * Get layout container from server and replace received HTML
         * in containers marked with <b>data-plenty-itemview-template="..."</b>
         * @function reloadItemContainer
         * @param    {string} container    Name of the (item view) template to load from server
         * @return  {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function reloadItemContainer( container )
        {
            if( $( '[data-plenty-itemview-template="' + container + '"]' ).length > 0 )
            {
                return getContainer( 'itemview' + container ).from( 'itemview' )
                    .done( function( response )
                    {
                        $( '[data-plenty-itemview-template="' + container + '"]' )
                            .each( function( i, elem )
                            {
                                $( elem ).html( response.data[0] );
                                pm.getInstance().bindDirectives( elem );
                                $( window ).trigger( 'contentChanged' );

                            } );
                    } );
            }
            else
            {
                return API.idle();
            }
        }

        /**
         * Prepare the request to receive Layout parameters for a template
         * @function getParams
         * @param   {string} containerName The Layoutcontainer to receive the parameteres of.
         * @param   {object} params   Additional GET-parameters.
         * @returns {object}               The prepared request. Call <code>.from( layoutGroup )</code> to specify the
         *     location in the CMS
         *                                 (e.g. 'ItemView')
         * @example
         *          CMSFactory.getParams( 'BasketItemsList' ).from( 'ItemView' )
         *              .done(function( response ) {
         *                  // BasketItems
         *                  var items = response.data;
         *              });
         */
        function getParams( containerName, params )
        {

            function from( layoutGroup )
            {
                return API.get( '/rest/' + layoutGroup.toLowerCase() + '/' + containerName.toLowerCase() + '/', params );
            }

            return {
                from: from
            }
        }

        /**
         * Get the content of a category specified by its ID
         * @function getCategoryContent
         * @param   {number} categoryID    The ID of the category to get the content from
         * @returns {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function getCategoryContent( categoryID )
        {

            return API.get( '/rest/categoryview/categorycontentbody/?categoryID=' + categoryID );
        }

        /**
         * Get category content from server and replace received HTML
         * in containers marked with <b>data-plenty-checkout-catcontent="..."</b>
         * @function reloadCatContent
         * @param    {number} catId    ID of the category to load content (description 1) from server
         * @return  {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function reloadCatContent( catId )
        {

            if( $( '[data-plenty-checkout-catcontent="' + catId + '"]' ) )
            {
                return getCategoryContent( catId )
                    .done( function( response )
                    {
                        $( '[data-plenty-checkout-catcontent="' + catId + '"]' )
                            .each( function( i, elem )
                            {
                                $( elem ).html( response.data[0] );
                                pm.getInstance().bindDirectives( elem );
                                $( window ).trigger( 'contentChanged' );

                            } );
                    } );
            }
            else
            {
                return API.idle();
            }

        }

    }, ['APIFactory'] );
}( PlentyFramework ));