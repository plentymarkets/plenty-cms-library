/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function($, pm) {

    /*
     * Toggle Class
     * toggle style-classes on click
     * Usage / data-attribute:
     * <div data-plenty-toggle="{target: 'body', class: 'toggledClass', media: 'xs sm'}"></div>
     * target	:	jQuery selector to toggle the class at.
     * class		:  class(es) to toggle at target element
     * media		:  only toggle class on given media sizes (optional)
     *
     * (!) using data-plenty-toggle on <a>-elements will prevent redirecting to href=""
     */
    pm.directive('[data-plenty-toggle]', function(i, elem, MediaSizeService) {
        if( $(elem).attr('data-plenty-toggle').search(';') < 0 ) {
            eval('var data = ' + $(elem).attr('data-plenty-toggle'));
            if ( data.target && data.class ) {
                $(elem).click(function() {
                    var isMedia = false;
                    if ( data.media ) {
                        if ( data.media.indexOf(' ') != -1 ) {
                            var mediaArr = data.media.split(' ');
                            for ( i = 0; i < mediaArr.length; i++ ) {
                                if ( MediaSizeService.interval() == mediaArr[i] ) {
                                    isMedia = true;
                                }
                            }
                        }
                        else {
                            if ( MediaSizeService.interval() == data.media ) isMedia = true;
                        }
                    }
                    if ( ! data.media || isMedia == true  ) {
                        $(data.target).toggleClass(data.class);
                        if ( $(elem).is('a') ) return false;
                    }
                });
            }
        }
    }, ['MediaSizeService']);

}(jQuery, PlentyFramework));