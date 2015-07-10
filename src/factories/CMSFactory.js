(function(pm) {

	pm.factory('CMSFactory', function(API) {

		return {
            getContainer: getContainer,
            getParams: getParams,
            getCategoryContent: getCategoryContent
		};

        /**
         * Prepare the request to receive HTML-Content from CMS
         * @param containerName     The Layoutcontainer to receive.
         * @returns {object}        The prepared request. Call .from( layoutGroup ) to specify the location in the CMS
         *                          (e.g. 'Checkout')
         */
        function getContainer( containerName, params ) {

            function from( layoutGroup ) {

                params = params || '';
                return API.get( '/rest/' + layoutGroup.toLowerCase() + '/container_' + containerName.toLowerCase() + '/' + params );

            }

            return {
                from: from
            }

        }

        /**
         * Prepare the request to receive Layout parameters for a template
         * @param containerName     The Layoutcontainer to receive the params for
         * @returns {object}        The prepared request. Call .from( layoutGroup ) to specify the location in the CMS
         *                          (e.g. 'Checkout')
         */
        function getParams( containerName, params ) {

            function from( layoutGroup ) {

                params = params || '';
                return API.get( '/rest/' + layoutGroup.toLowerCase() + '/' + containerName.toLowerCase() + '/' + params );

            }

            return {
                from: from
            }
        }

        /**
         * Get the content of a category specified by its ID
         * @param categoryID    The ID of the category to get the content from
         * @returns {*|{}}      deferred request object
         */
        function getCategoryContent( categoryID ) {

            return API.get( '/rest/categoryview/categorycontentbody/?categoryID=' + categoryID );
        }

	}, ['APIFactory']);
}(PlentyFramework));