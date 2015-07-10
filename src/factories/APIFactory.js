(function($, pm) {

	pm.factory('APIFactory', function(UI) {

		return {
            get: _get,
            post: _post,
            put: _put,
            delete: _delete
		};

        function handleError( jqXHR ) {
            var responseText = $.parseJSON(jqXHR.responseText);
            UI.printErrors( responseText.error.error_stack );
        }

        /**
         * Handle a GET request
         * @param url   The URL to send the request to
         * @returns {*} Deferred request object
         */
        function _get( url, ignoreErrors ) {

            return $.ajax(
                url,
                {
                    type:       'GET',
                    dataType:   'json',
                    error:      function( jqXHR ) { if( !ignoreErrors ) handleError( jqXHR ) }
                }
            );

        }

        /**
         * Handle a POST request
         * @param url   The URL to send the request to
         * @param data  The data to append to the request. Will be converted to JSON internally.
         * @returns {*} Deferred request object
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
         * Handle a PUT request
         * @param url   The URL to send the request to
         * @param data  The data to append to the request. Will be converted to JSON internally.
         * @returns {*} Deferred request object
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
         * Handle a DELETE request
         * @param url   The URL to send the request to
         * @returns {*} Deferred request object
         */
        function _delete( url, ignoreErrors ) {

            return $.ajax(
                url,
                {
                    type:       'DELETE',
                    dataType:   'json',
                    error:      function( jqXHR ) { if( !ignoreErrors ) handleError( jqXHR ) }
                }
            );

        }

    }, ['UIFactory']);
}(jQuery, PlentyFramework));