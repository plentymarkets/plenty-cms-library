/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function($, pm) {

    // link non-anchor elements
    pm.directive('a[data-plenty-href]', function(i, elem, MediaSizeService) {
        $(elem).each(function() {
            var href = $(this).attr('href');
            var identifier = $(this).attr('data-plenty-href');

            $('[data-plenty-link="'+identifier+'"]').click(function() {
                if( MediaSizeService.interval() != 'xs' ) {
                    window.location.assign( href );
                }
            });
        });
    }, ['MediaSizeService']);

}(jQuery, PlentyFramework));