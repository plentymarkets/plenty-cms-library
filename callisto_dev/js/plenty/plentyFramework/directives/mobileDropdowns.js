(function($, pm) {

    /*
     * Mobile dropdowns
     * Toggles dropdowns using css class 'open' instead of pseudo class :hover
     * Usage:
         <li class="dropdown">
         <a data-plenty-enable="CONDITION">...</a>
         </li>
     *
     * possible values for CONDITION
     * "touch"						: use 'open'-class if device is touch-device AND media size is 'md' or 'lg'
     * "toggle-xs-sm-or-touch" : use 'open'-class if device is "touch" (as above) OR media size is 'xs' or 'sm'
     */
    // TODO: handle external dependency to Modernizr
    pm.directive('.dropdown > a[data-plenty-enable]', function(i, elem) {

       if( $(elem).attr('data-plenty-enable') == "toggle-xs-sm-or-touch" ) {
            $(elem).click(function(e) {
                if ( window.mediaSize == 'xs' || window.mediaSize == 'sm' || ( window.mediaSize != 'xs' && window.mediaSize != 'sm' && Modernizr.touch ) ) {
                    $('.dropdown.open > a[data-plenty-enable="toggle-xs-sm-or-touch"]').not( $(this) ).parent().removeClass('open');
                    $(this).parent().toggleClass('open');
                    return false;
                }
            });
        }

        // dropdown enabled touch
        else if( $(elem).attr('data-plenty-enable') == "touch" ) {
            $(elem).click(function() {
                if ( window.mediaSize != 'xs' && window.mediaSize != 'sm' && Modernizr.touch ) { // otherwise already has mobile navigation
                    $('.dropdown.open > a[data-plenty-enable="touch"]').not( $(this) ).parent().removeClass('open');
                    if ( ! $(this).parent().hasClass('open') ) {
                        $(this).parent().addClass('open');
                        return false;
                    }
                }
            });
        }
    });

    pm.directive('*', function(i, elem) {

        $(elem).click(function (e) {
            if (window.mediaSize == 'xs' || window.mediaSize == 'sm' || ( window.mediaSize != 'xs' && window.mediaSize != 'sm' && Modernizr.touch )) {
                var dropdown = $('.dropdown.open > a[data-plenty-enable="toggle-xs-sm-or-touch"]').parent();
                if (dropdown.length > 0 && !dropdown.is(e.target) && dropdown.has(e.target).length <= 0) {
                    dropdown.removeClass('open');
                }
            }

            if (window.mediaSize != 'xs' && window.mediaSize != 'sm' && Modernizr.touch) {
                var dropdown = $('.dropdown.open > a[data-plenty-enable="touch"]').parent();
                if (dropdown.length > 0 && !dropdown.is(e.target) && dropdown.has(e.target).length <= 0) {
                    dropdown.removeClass('open');
                }
            }
        });
    });

    pm.directive(window, function() {
        $(window).on('orientationchange', function() {
            if ( window.mediaSize == 'xs' || window.mediaSize == 'sm' || ( window.mediaSize != 'xs' && window.mediaSize != 'sm' && Modernizr.touch ) ) {
                $('.dropdown.open > a[data-plenty-enable="toggle-xs-sm-or-touch"]').parent().removeClass('open');
            }

            if ( window.mediaSize != 'xs' && window.mediaSize != 'sm' && Modernizr.touch ) {
                $('.dropdown.open > a[data-plenty-enable="touch"]').parent().removeClass('open');
            }
        });
        $(window).on('sizeChange', function() {
            if ( window.mediaSize != 'xs' && window.mediaSize != 'sm' && ! Modernizr.touch ) {
                $('.dropdown.open > a[data-plenty-enable="toggle-xs-sm-or-touch"]').parent().removeClass('open');
            }
        });
    });

    $(document).ready(function() {

        if ( window.mediaSize != 'xs' && window.mediaSize != 'sm' && Modernizr.touch ) {
            $('.dropdown.open > a[data-plenty-enable="touch"]').parent().removeClass('open');
        }

    });

}(jQuery, PlentyFramework));