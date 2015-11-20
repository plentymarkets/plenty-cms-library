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
        var toggleClass    = "open";
        var activeDropdown = null;

        return {
            initMobileDropdown: initMobileDropdown,
            openDropdown      : openDropdown
        };

        function initMobileDropdown()
        {
            $( window ).on( 'orientationchange sizeChange', function()
            {
                $( '[data-plenty="click:UI.toggleHideShow(this)"]' ).parent( "li." + toggleClass ).removeClass( toggleClass );
                /*if ( !!activeDropdown )
                 {
                 activeDropdown.parent().removeClass( toggleClass );

                 //activeDropdown.parents( "ul" ).find( "li." + toggleClass ).removeClass( toggleClass );
                 activeDropdown = null;
                 }*/
            } );

            // close open menu on click outside menu
            $( 'html' ).click( function()
            {
                $( '[data-plenty="click:UI.toggleHideShow(this)"]' ).parent( "li.open" ).removeClass( 'open' );
                /*if ( !!activeDropdown )
                 {
                 activeDropdown.parent().removeClass( toggleClass );
                 activeDropdown = null;
                 }*/
            } );
        }

        function openDropdown( elem, mediaSizes )
        {
            var $elem = $( elem );
            var activeParent;

            if ( Modernizr.touch && MediaSizeService.isInterval( 'md, lg' )
                || MediaSizeService.isInterval( mediaSizes ) )
            {
                if ( !!activeDropdown && activeDropdown[0] == $elem[0] )
                {
                    activeDropdown.parent().removeClass( toggleClass );
                    activeDropdown = null;
                }
                else
                {
                    if ( !!activeDropdown && activeDropdown[0] != $elem[0] )
                    {
                        activeDropdown.parent().removeClass( toggleClass );
                    }
                    activeDropdown = $elem;
                    activeParent   = activeDropdown.parent();
                    activeParent.click( function( event )
                    {
                        event.stopPropagation();
                    } );
                    if ( !activeParent.hasClass( toggleClass ) )
                    {
                        activeParent.addClass( toggleClass );
                    }
                }
            }
        }

    }, ['MediaSizeService'] );
}( jQuery, PlentyFramework ));