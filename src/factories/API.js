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

        function get( url, onSuccess, onError ) {

            if( !!onSuccess ) onSuccess = function(response) {};
            if( !!onError ) onError = handleError;

            return $.ajax(
                url,
                {
                    type:       'GET',
                    dataType:   'json',
                    success:    onSuccess,
                    error:      onError
                }
            );

        }

        function post( url, data, onSuccess, onError ) {

            if( !!onSuccess ) onSuccess = function(response) {};
            if( !!onError ) onError = handleError;

            return $.ajax(
                url,
                {
                    type:       'POST',
                    data:       JSON.stringify(data),
                    dataType:   'json',
                    success:    onSuccess,
                    error:      onError
                }
            );
        }

        function put( url, data, onSuccess, onError ) {

            if( !!onSuccess ) onSuccess = function(response) {};
            if( !!onError ) onError = handleError;

            return $.ajax(
                url,
                {
                    type:       'PUT',
                    data:       JSON.stringify(data),
                    dataType:   'json',
                    success:    onSuccess,
                    error:      onError
                }
            );

        }

    }, ['UI']);
}(jQuery, PlentyFramework));