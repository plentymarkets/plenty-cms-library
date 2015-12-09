(function( $, pm )
{
    pm.directive( 'Checkout', function( CheckoutService )
    {

        return {
            setMethodOfPayment: setMethodOfPayment
        };

        function setMethodOfPayment()
        {
            var $form = $( '[data-plenty-checkout-form="methodOfPayment"]' );
            CheckoutService.setMethodOfPayment( $form.getFormValues().MethodOfPaymentID, $form.find('[name="atrigaPaymaxConfirm"]' ).is(':checked') )
                .fail( function( jqXHR ) {
                    var response = $.parseJSON( jqXHR.responseText );
                    if( response.error.error_stack[0].code == 1 )
                    {

                    }

                });
        }

    }, ['CheckoutService'] );
})( jQuery, PlentyFramework );