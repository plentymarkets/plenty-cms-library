/**
 * Mobile dropdowns
 * Toggles dropdowns using css class 'open' instead of pseudo class :hover
 * Usage:
 * <li class="dropdown">
 *     <a data-plenty-enable="CONDITION">...</a>
 * </li>
 *
 * possible values for CONDITION
 * "touch"                        : use 'open'-class if device is touch-device AND media size is 'md' or 'lg'
 * "toggle-xs-sm-or-touch" : use 'open'-class if device is "touch" (as above) OR media size is 'xs' or 'sm'
 *
 */
(function( $, pm )
{
    // TODO: handle external dependency to Modernizr
    pm.directive( 'MobileDropdown', function( MediaSizeService )
    {
        var sizes                 = {xs: "xs", sm: "sm"};
        var toggleClass           = "open";
        var resizeOrTouchSelector = '.dropdown.open > a[data-plenty-enable="toggle-xs-sm-or-touch"]';
        var aTouchSelector        = '.dropdown.open > a[data-plenty-enable="touch"]';
        var activeDropdown        = null;

        if ( isIntervalNotFitting() )
        {
            $( aTouchSelector ).parent().removeClass( 'open' );
        }

        return {
            initMobileDropdown: initMobileDropdown,
            mobileMenu        : mobileMenu,
            openDropdown      : openDropdown
        };

        function initMobileDropdown()
        {
            $( window ).on( 'orientationchange', function()
            {
                if ( isFittingOrNotInterval() )
                {
                    $( resizeOrTouchSelector ).parent().removeClass( toggleClass );
                }

                if ( isIntervalNotFitting() )
                {
                    $( aTouchSelector ).parent().removeClass( toggleClass );
                }
            } );

            $( window ).on( 'sizeChange', function( newValue )
            {
                if ( newValue != sizes.xs && newValue != sizes.sm && !Modernizr.touch )
                {
                    $( resizeOrTouchSelector ).parent().removeClass( toggleClass );
                }
            } );
        }

        function openDropdown( elem, mediaSizes, touch )
        {
            var $elem = $( elem );
            var activeParent;

            if ( MediaSizeService.isInterval( mediaSizes )
                || (touch == "touch" && Modernizr.touch)
                || (!Modernizr.touch && touch != "touch") )
            {

                if ( activeDropdown )
                {
                    activeDropdown.parent().removeClass( toggleClass );
                }
                if ( !activeDropdown || activeDropdown[0] != $elem[0] )
                {
                    activeDropdown = $elem;
                    activeParent   = activeDropdown.parent();
                    if ( !activeParent.hasClass( toggleClass ) )
                    {
                        activeParent.addClass( toggleClass );
                    }
                }
            }
        }

        function mobileMenu( elem, condition )
        {
            var $elem       = $( elem );
            var $elemParent = $elem.parent();

            $( 'html' ).click( function()
            {
                $( resizeOrTouchSelector ).not( $elem ).parent().removeClass( toggleClass );
            } );

            if ( condition == "toggle-xs-sm-or-touch" )
            {
                $elem.click( function( e )
                {
                    if ( isFittingOrNotInterval() )
                    {
                        $( resizeOrTouchSelector ).not( $elem ).parent().removeClass( toggleClass );
                        $elemParent.toggleClass( toggleClass );
                        return false;
                    }
                } );
            }

            // dropdown enabled touch
            else if ( condition == "touch" )
            {
                $elem.click( function()
                {
                    if ( isIntervalNotFitting() )
                    { // otherwise already has mobile navigation
                        $( aTouchSelector ).not( $elem ).parent().removeClass( toggleClass );
                        $elemParent.addClass( toggleClass );
                        return false;
                    }
                } );
            }
        }

        pm.directive( '*', function( i, elem, MediaSizeService )
        {

            $( elem ).click( function( e )
            {
                if ( isFittingOrNotInterval() )
                {
                    var dropdown = $( resizeOrTouchSelector ).parent();
                    if ( dropdown.length > 0 && !dropdown.is( e.target ) && dropdown.has( e.target ).length <= 0 )
                    {
                        dropdown.removeClass( toggleClass );
                    }
                }

                if ( isIntervalNotFitting() )
                {
                    var dropdown = $( aTouchSelector ).parent();
                    if ( dropdown.length > 0 && !dropdown.is( e.target ) && dropdown.has( e.target ).length <= 0 )
                    {
                        dropdown.removeClass( toggleClass );
                    }
                }
            } );
        }, ['MediaSizeService'] );

        function isIntervalNotFitting()
        {
            return (!MediaSizeService.isInterval( "xs, sm" ) && Modernizr.touch);
        }

        function isFittingOrNotInterval()
        {
            return (MediaSizeService.isInterval( "xs, sm" ) || isIntervalNotFitting());
        }

    }, ['MediaSizeService'] );
}( jQuery, PlentyFramework ));