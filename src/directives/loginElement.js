(function($, pm) {

    pm.directive('[data-plenty-checkout-form="customerLogin"]', function(i, elem, AuthenticationService) {
        $(elem).on('submit', function (e) {
            e.preventDefault();
            AuthenticationService.customerLogin( $(e.target) );
        });
    }, ["AuthenticationService"]);

}(jQuery, PlentyFramework));