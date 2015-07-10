(function($, pm) {

    pm.directive('[data-plenty-checkout-form="customerLogin"]', function(i, elem, AuthenticationService) {
        $(elem).on('submit', function () {
            plenty = pm.getInstance();
            AuthenticationService.customerLogin();
            return false;
        });
    });

}(jQuery, PlentyFramework, ["AuthenticationService"]));