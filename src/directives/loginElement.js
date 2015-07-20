/**
 * Licensed under AGBL v3
 * (https://github.com/plentymarkets/plentymarketsCMStools/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function($, pm) {

    pm.directive('[data-plenty-checkout-form="customerLogin"]', function(i, elem, AuthenticationService) {
        $(elem).on('submit', function (e) {
            e.preventDefault();
            AuthenticationService.customerLogin( $(e.target) );
        });
    }, ["AuthenticationService"]);

}(jQuery, PlentyFramework));