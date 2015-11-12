/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
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

        var positionToTopButton = function() {
            if( $(document).scrollTop() > 100 ) {
                $(elem).addClass('visible');
            } else {
                $(elem).removeClass('visible');
            }
        };

        $(window).on("scroll resize", function() {
            positionToTopButton();
        });

    });

}(jQuery, PlentyFramework));