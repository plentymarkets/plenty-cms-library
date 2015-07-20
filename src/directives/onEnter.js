/**
 * Licensed under AGBL v3
 * (https://github.com/plentymarkets/plentymarketsCMStools/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function($, pm) {

    // Call function if enter key pressed while element is focused
    pm.directive('[data-plenty-onenter]', function(i, elem) {
        var onEnter = $(elem).attr('data-plenty-onenter');
        var callback = typeof window[onEnter] === 'function' ? window[onEnter] : (new Function('return ' + onEnter));
        $(elem).on('keypress', function(e) {

            if(e.which === 13 && !!callback && typeof callback === "function") {
                callback.call();
            }
        });
    });

}(jQuery, PlentyFramework));