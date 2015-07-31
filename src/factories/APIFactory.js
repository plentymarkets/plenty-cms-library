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
     * Handles requests to ReST API. Provides a {{#crossLink "APIFactory/handleError:method"}}default error-handling{{/crossLink}}.
     * Request parameters will be parsed to json internally<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "UIFactory"}}UIFactory{{/crossLink}}</li>
     * </ul>
     * @class APIFactory
     * @static
     */
	pm.factory('APIFactory', function(UI) {

		return {
            get: _get,
            post: _post,
            put: _put,
            delete: _delete,
            idle: _idle
		};

        /**
         * Is called by default if a request failed.<br>
         * Can be prevented by setting the requests last parameter to false.
         *
         * @function handleError
         * @private
         *
         * @param {object} jqXHR   <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function handleError( jqXHR ) {
            var responseText = $.parseJSON(jqXHR.responseText);
            UI.printErrors( responseText.error.error_stack );
        }


        /**
         * Sends a GET request to ReST-API
         *
         * @function get
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    params                  The data to append to requests body. Will be converted to JSON internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @return  {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function _get( url, params, ignoreErrors ) {

            return $.ajax(
                url,
                {
                    type:       'GET',
                    data:       params,
                    dataType:   'json',
                    error:      function( jqXHR ) { if( !ignoreErrors ) handleError( jqXHR ) }
                }
            );

        }

        /**
         * Sends a POST request to ReST-API
         *
         * @function post
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    data                    The data to append to requests body. Will be converted to JSON internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @return  {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function _post( url, data, ignoreErrors ) {

            return $.ajax(
                url,
                {
                    type:       'POST',
                    data:       JSON.stringify(data),
                    dataType:   'json',
                    error:      function( jqXHR ) { if( !ignoreErrors ) handleError( jqXHR ) }
                }
            );
        }

        /**
         * Sends a PUT request to ReST-API
         *
         * @function put
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    data                    The data to append to requests body. Will be converted to JSON internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @return  {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function _put( url, data, ignoreErrors ) {

            return $.ajax(
                url,
                {
                    type:       'PUT',
                    data:       JSON.stringify(data),
                    dataType:   'json',
                    error:      function( jqXHR ) { if( !ignoreErrors ) handleError( jqXHR ) }
                }
            );

        }

        /**
         * Sends a DELETE request to ReST-API
         *
         * @function delete
         *
         * @param   {string}    url                     The URL to send the request to
         * @param   {object}    data                    The data to append to requests body. Will be converted to JSON internally
         * @param   {boolean}   [ignoreErrors=false]    disable/ enable defaults error handling
         * @returns {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function _delete( url, data, ignoreErrors ) {

            return $.ajax(
                url,
                {
                    type:       'DELETE',
                    data:       JSON.stringify(data),
                    dataType:   'json',
                    error:      function( jqXHR ) { if( !ignoreErrors ) handleError( jqXHR ) }
                }
            );

        }

        /**
         * Get a idle request doing nothing for chaining methods
         * @returns {object}    <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function _idle() {
            return $.Deferred().resolve();
        }

    }, ['UIFactory']);
}(jQuery, PlentyFramework));