(function( $, pm )
{
    pm.directive( 'Checkout', function( CheckoutService )
    {

        return {
            setMethodOfPayment: setMethodOfPayment,
            confirmAtrigaPaymax: confirmAtrigaPaymax
        };

        function setMethodOfPayment( paymentID )
        {
            CheckoutService.setMethodOfPayment( paymentID );
        }

        function confirmAtrigaPaymax( atrigaPaymaxConfirmed )
        {
            CheckoutService.confirmAtrigaPaymax( atrigaPaymaxConfirmed );
        }
    }, ['CheckoutService'] );
})( jQuery, PlentyFramework );