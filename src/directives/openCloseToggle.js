/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function($, pm) {

    // Tree navigation toggle
    pm.directive('[data-plenty="openCloseToggle"]', function(i, elem) {
        $(elem).click(function () {
            $(elem).parent().addClass(pm.cssClasses.animating);
            $(elem).siblings('ul').slideToggle(200, function () {
                if ($(elem).parent().is('.open')) {
                    $(elem).parent().removeClass(pm.cssClasses.open);
                }
                else {
                    $(elem).parent().addClass(pm.cssClasses.open);
                }
                $(elem).removeAttr('style');
                $(elem).parent().removeClass(pm.cssClasses.animating);
            });
        });

    });

}(jQuery, PlentyFramework));