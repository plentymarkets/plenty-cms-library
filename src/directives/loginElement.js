(function($, pm) {

    pm.directive('[data-plenty-checkout-form="customerLogin"]', function(i, elem, Authenticator) {
        $(elem).on('submit', function () {
            plenty = pm.getInstance();
            Authenticator.customerLogin();
            return false;
        });
    });

}(jQuery, PlentyFramework, ["Authenticator"]));