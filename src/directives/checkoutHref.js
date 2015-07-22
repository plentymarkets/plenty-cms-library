/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function($, pm) {
	pm.directive('[data-plenty-checkout-href]', function(i, elem, NavigatorService) {
        $(elem).click(function () {
            NavigatorService.goToID( $(this).attr('data-plenty-checkout-href') );
        });
	}, ['NavigatorService']);
} (jQuery, PlentyFramework));