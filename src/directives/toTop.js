/**
 * Licensed under AGBL v3
 * (https://github.com/plentymarkets/plentymarketsCMStools/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function($, pm) {

    pm.directive('[data-plenty="toTop"]', function(i, elem) {
        $(elem).click(function() {
            $('html, body').animate({
                scrollTop: 0
            }, 400);
            return false;
        });
    });

}(jQuery, PlentyFramework));