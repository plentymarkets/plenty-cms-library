CheckoutManager = {};

(function( $, pm )
{
    CheckoutManager.init = function()
    {
        pm.NavigatorService.init();
    };

    CheckoutManager.Navigator = {};

    CheckoutManager.Navigator.fillNavigation = function()
    {
        pm.NavigatorService.fillNavigation();
    };


})( jQuery, PlentyFramework );