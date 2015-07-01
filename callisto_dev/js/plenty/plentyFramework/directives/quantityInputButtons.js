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

}(jQuery, PlentyFramework));