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