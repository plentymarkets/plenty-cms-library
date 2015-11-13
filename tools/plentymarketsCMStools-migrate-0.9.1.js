(function($, pm) {

    PlentyFramework.getInstance().bindDirectives = function( rootElement ) {

        var $rootElement = $( rootElement || 'body' );

        $rootElement.find( '[data-plenty="addBasketItemButton"]' ).each(function(i, button) {

            $(button).click(function(e) {
                e.preventDefault();
                pm.directives['Basket'].addBasketItem( button );
            });

        });

        $rootElement.find( '[data-plenty="quantityInputButtonPlus"]' ).each(function(i, button) {

            $(button).click(function() {
                pm.directives['Basket'].changeItemQuantity( button, 1 );
            });

        });

        $rootElement.find( '[data-plenty="quantityInputButtonMinus"]' ).each(function(i, button) {

            $(button).click(function() {
                pm.directives['Basket'].changeItemQuantity( button, -1 );
            });

        });

        $rootElement.find( '[data-basket-item-id] [data-plenty="quantityInput"]' ).each(function(i, input) {

            $(input).on('change', function() {
                var basketItemID = self.parents('[data-basket-item-id]').attr('data-basket-item-id');
                pm.directives['Basket'].setItemQuantity( basketItemID, input );
            });

        });

    };

})(jQuery, PlentyFramework);