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
(function( $, pm )
{

    /**
     * Handles requests to ReST API. Provides a {{#crossLink "APIFactory/handleError:method"}}default
     * error-handling{{/crossLink}}. Request parameters will be parsed to json internally<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "UIFactory"}}UIFactory{{/crossLink}}</li>
     * </ul>
     * @class APIFactory
     * @static
     */
    pm.factory( 'APIFactory', function( UI, Modal )
    {

        var sessionExpirationTimeout = null;
        $( document ).ready( function()
        {
            renewLoginSession();
        } );

        return {
            get   : _get,
            post  : _post,
            put   : _put,
            delete: _delete,
            idle  : _idle
        };

        function renewLoginSession()
        {
            if ( !pm.getGlobal( 'LoginSession' ) )
            {
                return;
            }

            if ( !!sessionExpirationTimeout )
            {
                clearTimeout( sessionExpirationTimeout );
            }

            sessionExpirationTimeout = setTimeout( function()
            {
                $( window ).trigger( 'login-expired' );

                if ( pm.getGlobal( 'PageDesign' ) === "Checkout" )
                {
                    Modal.prepare()
                        .setTitle( pm.translate( 'Your session has expired.' ) )
                        .setContent( pm.translate( 'Please log in again to continue shopping.' ) )
                        .setLabelDismiss( null )
                        .setLabelConfirm( pm.translate( 'OK' ) )
                        .onConfirm( function()
                        {
                            window.location.assign( '/' );
                        } )
                        .onDismiss( function()
                        {
                            window.location.assign( '/' );
                        } )
                        .show();
                }

            }, pm.getGlobal( 'LoginSessionExpiration' ) );
        }

        /**
         * Is called by default if a request failed.<br>
         * Can be prevented by setting the requests last parameter to false.
         *
         * @function handleError
         * @private
         *
         * @param {object} jqXHR   <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery
         *     deferred Object</a>
         */
        function handleError( jqXHR )
        {
            try
            {
                var responseText = $.parseJSON( jqXHR.responseText );
                UI.printErrors( responseText.error.error_stack );
            }
            catch ( e )
            {
                UI.throwError( jqXHR.status, jqXHR.statusText );
            }
        }

        /**
         * Sends a GET request to ReST-API
         *
         * @function get
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    params                  The data to append to requests body. Will be converted to JSON
         *     internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @param   {boolean}   [runInBackground=false] show wait screen while request is in progress.
         * @return  {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery
         *     deferred Object</a>
         */
        function _get( url, params, ignoreErrors, runInBackground, sync )
        {

            if ( !runInBackground )
            {
                UI.showWaitScreen();
            }

            return $.ajax(
                url,
                {
                    type    : 'GET',
                    data    : params,
                    dataType: 'json',
                    async   : !sync,
                    error   : function( jqXHR )
                    {
                        if ( !ignoreErrors )
                        {
                            handleError( jqXHR )
                        }
                    }
                }
            ).always( function()
            {
                if ( !runInBackground )
                {
                    UI.hideWaitScreen();
                }
                renewLoginSession();
            } );

        }

        /**
         * Sends a POST request to ReST-API
         *
         * @function post
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    data                    The data to append to requests body. Will be converted to JSON
         *     internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @param   {boolean}   [runInBackground=false] show wait screen while request is in progress.
         * @return  {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery
         *     deferred Object</a>
         */
        function _post( url, data, ignoreErrors, runInBackground )
        {

            var params = {
                type    : 'POST',
                dataType: 'json',
                error   : function( jqXHR )
                {
                    if ( !ignoreErrors )
                    {
                        handleError( jqXHR )
                    }
                }
            };

            if ( !!data && data.isFile )
            {
                params.cache       = data.cache;
                params.processData = data.processData;
                params.data        = data.data;
                params.contentType = false;
            }
            else
            {
                params.data        = JSON.stringify( data );
                params.contentType = 'application/json';
            }

            if ( !runInBackground )
            {
                UI.showWaitScreen();
            }

            return $.ajax(
                url, params
            ).always( function()
            {
                if ( !runInBackground )
                {
                    UI.hideWaitScreen();
                }
                renewLoginSession();
            } );
        }

        /**
         * Sends a PUT request to ReST-API
         *
         * @function put
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    data                    The data to append to requests body. Will be converted to JSON
         *     internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @param   {boolean}   [runInBackground=false] show wait screen while request is in progress.
         * @return  {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery
         *     deferred Object</a>
         */
        function _put( url, data, ignoreErrors, runInBackground )
        {

            if ( !runInBackground )
            {
                UI.showWaitScreen();
            }

            return $.ajax(
                url,
                {
                    type       : 'PUT',
                    data       : JSON.stringify( data ),
                    dataType   : 'json',
                    contentType: 'application/json',
                    error      : function( jqXHR )
                    {
                        if ( !ignoreErrors )
                        {
                            handleError( jqXHR )
                        }
                    }
                }
            ).always( function()
            {
                if ( !runInBackground )
                {
                    UI.hideWaitScreen();
                }
                renewLoginSession();
            } );

        }

        /**
         * Sends a DELETE request to ReST-API
         *
         * @function delete
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    data                    The data to append to requests body. Will be converted to JSON
         *     internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @param   {boolean}   [runInBackground=false] show wait screen while request is in progress.
         * @returns {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery
         *     deferred Object</a>
         */
        function _delete( url, data, ignoreErrors, runInBackground )
        {

            if ( !runInBackground )
            {
                UI.showWaitScreen();
            }

            return $.ajax(
                url,
                {
                    type       : 'DELETE',
                    data       : JSON.stringify( data ),
                    dataType   : 'json',
                    contentType: 'application/json',
                    error      : function( jqXHR )
                    {
                        if ( !ignoreErrors )
                        {
                            handleError( jqXHR )
                        }
                    }
                }
            ).always( function()
            {
                if ( !runInBackground )
                {
                    UI.hideWaitScreen();
                }
                renewLoginSession();
            } );

        }

        /**
         * Get a idle request doing nothing for chaining methods
         * @returns {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery
         *     deferred Object</a>
         */
        function _idle()
        {
            return $.Deferred().resolve();
        }

    }, ['UIFactory', 'ModalFactory'] );
}( jQuery, PlentyFramework ));