(function($, pm) {
	pm.directive('[data-plenty-checkout-href]', function(i, elem, NavigatorService) {
        $(elem).click(function () {
            NavigatorService.goToID( $(this).attr('data-plenty-checkout-href') );
        });
	}, ['NavigatorService']);
} (jQuery, PlentyFramework));