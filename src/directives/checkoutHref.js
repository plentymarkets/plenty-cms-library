(function($, pm) {
	pm.directive('[data-plenty-checkout-href]', function(i, elem, Navigator) {
        $(elem).click(function () {
            Navigator.goToID( $(this).attr('data-plenty-checkout-href') );
        });
	}, ['Navigator']);
} (jQuery, PlentyFramework));