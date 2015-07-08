(function($, pm) {

	pm.factory('API', function(UI) {

		return {
            get: get,
            post: post,
            put: put
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
        function get( url ) {

            return $.ajax(
                url,
                {
                    type:       'GET',
                    dataType:   'json',
                    error:      handleError
                }
            );

        }

        /**
         * Handle a POST request
         * @param url   The URL to send the request to
         * @param data  The data to append to the request. Will be converted to JSON internally.
         * @returns {*} Deferred request object
         */
        function post( url, data ) {

            return $.ajax(
                url,
                {
                    type:       'POST',
                    data:       JSON.stringify(data),
                    dataType:   'json',
                    error:      handleError
                }
            );
        }

        /**
         * Handle a PUT request
         * @param url   The URL to send the request to
         * @param data  The data to append to the request. Will be converted to JSON internally.
         * @returns {*} Deferred request object
         */
        function put( url, data ) {

            return $.ajax(
                url,
                {
                    type:       'PUT',
                    data:       JSON.stringify(data),
                    dataType:   'json',
                    error:      handleError
                }
            );

        }

    }, ['UI']);
}(jQuery, PlentyFramework));