(function(pm) {
	
	pm.factory('CheckoutManager', function(API, CMS, UI) {
		
		return {
			checkout: checkout,
            getCheckout: getCheckout,
            setCheckout: setCheckout,
            reloadContainer: reloadContainer,
            reloadCatContent: reloadCatContent,
            reloadItemContainer: reloadItemContainer
		};

        var checkout;
        function checkout() {
            return checkout;
        }

        /**
         * Receive global checkout data from ReST-API
         *
         * @return Promise interface
         */
        function getCheckout() {

            return API.get('/rest/checkout/')
                .done(function(response) {
                    if( !!response ) checkout = response.data;
                    else API.throwError(0, 'Could not receive checkout data [GET "/rest/checkout/" receives null value]');
                });
        }

        /**
         * Update checkout data on server
         *
         * @return Promise interface
         */
        function setCheckout() {

            return API.put('/rest/checkout', checkout)
                .done(function(response) {
                    if( !!response ) checkout = response.data;
                    else API.throwError(0, 'Could not receive checkout data [GET "/rest/checkout/" receives null value]');
                });

        }

        /**
         * Get layout container from server and replace received HTML
         * in containers marked width data-plenty-checkout-template="..."
         *
         * @param	container	Name of the template to load from server
         */
        function reloadContainer( container ) {
            UI.showWaitScreen();
            return CMS.getContainer( container ).from( 'checkout' )
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
         * in containers marked width data-plenty-checkout-catcontent="..."
         *
         * @param	catId	ID of the category to load content (description 1) from server
         * @return  Promise
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
         * in containers marked width data-plenty-itemview-template="..."
         *
         * @param	container	Name of the (item view) template to load from server
         * @return  Promise
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
				
	}, ['API', 'CMS', 'UI']);
}(PlentyFramework));