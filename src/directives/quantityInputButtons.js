/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function($, pm) {

    // TODO: merge to single directive. Differentiate between increasing and decreasing by additional parameter
    pm.directive('[data-plenty="quantityInputButtonPlus"]', function(i, elem) {
        // quantity input plus/minus buttons
        $(elem).click(function() {
            var input = $(elem).closest('[data-plenty="quantityInputWrapper"]').find('input');
            var value = parseInt( $(input).val() );
            var maxLength = ( $(input).attr('maxlength') != undefined ) ? parseInt($(input).attr('maxlength')) : 1000;
            if ( ( (value + 1) + '').length <= maxLength ) {
                $(input).val(value + 1);
            }
        });
    });

    pm.directive('[data-plenty="quantityInputButtonMinus"]', function(i, elem) {
        $(elem).click(function() {
            var input = $(elem).closest('[data-plenty="quantityInputWrapper"]').find('input');
            var value = parseInt( $(input).val() );
            if ( value > 1 ) {
                $(input).val(value - 1);
            }
        });
    });

    // Quantity Buttons in BasketView
    pm.directive('[data-basket-item-id] [data-plenty="quantityInputButtonPlus"], [data-basket-item-id] [data-plenty="quantityInputButtonMinus"]', function(i, button) {
        $(button).click(function() {

            if( !!$(button).data('timeout') ) {
                window.clearTimeout( $(button).data('timeout') );
            }

            var timeout = window.setTimeout(function() {
                $(button).parents('[data-plenty="quantityInputWrapper"]').find('[data-plenty="quantityInput"]').trigger('change');
            }, 1000);

            $(button).data('timeout', timeout);

        });
    });

    pm.directive('[data-basket-item-id] [data-plenty="quantityInput"]', function(i, input, BasketService) {
        $(input).change( function() {

            var newQuantity = parseInt( $(input).val() );
            var basketItemID = $(input).parents('[data-basket-item-id]').attr('data-basket-item-id');

            BasketService.setItemQuantity(
                basketItemID,
                newQuantity
            );
        });
    }, ['BasketService']);




}(jQuery, PlentyFramework));