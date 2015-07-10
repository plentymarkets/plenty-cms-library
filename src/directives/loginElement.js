(function($, pm) {

    pm.directive('[data-plenty-checkout-form="customerLogin"]', function(i, elem, AuthenticationService) {
        $(elem).on('submit', function () {
            AuthenticationService.customerLogin();
            return false;
        });
    }, ["AuthenticationService"]);

}(jQuery, PlentyFramework));