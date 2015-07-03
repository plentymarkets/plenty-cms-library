(function(pm) {

	pm.factory('CMS', function(API) {

		return {
            getContainer: getContainer,
            getParams: getParams,
            getCategoryContent: getCategoryContent
		};

        function getContainer( containerName ) {

            function from( layoutGroup ) {

                return API.get( '/' + layoutGroup.toLowerCase() + '/container_' + containerName.toLowerCase() );

            }

            return {
                from: from
            }

        }

        function getParams( containerName ) {

            function from( layoutGroup ) {

                return API.get( '/' + layoutGroup.toLowerCase() + '/' + containerName.toLowerCase() );

            }

            return {
                from: from
            }
        }

        function getCategoryContent( categoryID ) {

            return API.get( '/rest/categoryview/categorycontentbody/?categoryID=' + categoryID );
        }

	}, ['API']);
}(PlentyFramework));