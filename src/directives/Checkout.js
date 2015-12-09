(function( $, pm )
{
    pm.directive( 'Checkout', function( CheckoutService )
    {

        return {
            setMethodOfPayment: setMethodOfPayment
        };

        function setMethodOfPayment( paymentID )
        {
            CheckoutService.setMethodOfPayment( paymentID );
        }

    }, ['CheckoutService'] );
})( jQuery, PlentyFramework );