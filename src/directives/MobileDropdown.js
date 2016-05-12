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
    pm.directive( 'MobileDropdown', function( MediaSize )
    {
        // store all dropdown elements
        var dropdownElements = [];

        // store dropdown elements which should be closed by clicking outside the element itself
        var closableDropdownElements = [];

        return {
            initDropdowns: initDropdowns,
            openDropdown : openDropdown,
            slideDropdown: slideDropdown
        };

        function initDropdowns()
        {
            $( window ).on( 'orientationchange sizeChange', function()
            {
                resetDropdowns( dropdownElements );
                resetDropdowns( closableDropdownElements );
            } );

            // handle "close menu on click outside"
            $( 'html' ).on( "click touchstart", function( event )
            {
                resetDropdowns( closableDropdownElements, event );
            } );
        }

        function resetDropdowns( dropdownList, event )
        {
            var $current;
            for ( var i = 0; i < dropdownList.length; i++ )
            {
                $current = $( dropdownList[i] );
                if ( !!event )
                {
                    if ( $current.find( $( event.target ) ).length === 0 )
                    {
                        $current.removeClass( 'open' );
                    }
                }
                else
                {
                    $current.removeClass( 'open' );
                }
            }

        }

        function openDropdown( elem, alwaysClickable )
        {
            var $elem   = $( elem );
            var $parent = $elem.parent();

            // case 1: xs || sm || ( touch && ( md || lg ) ) -> open/close via click on small devices, open/close via
            // css-hover on desktop, open/close via click on touch-desktop (e.g. top navigation)

            if ( !!alwaysClickable && ( MediaSize.isInterval( 'xs, sm' ) || ( Modernizr.touch && MediaSize.isInterval( 'md, lg' ) ) ) )
            {
                if ( !$parent.is( '.open' ) )
                {
                    showDropdownHideOthers( $elem, $parent );

                    // if href
                    if ( !$elem.attr( 'href' ) )
                    {
                        avoidRedirectinStopPropagation( $parent.not( $elem ) );
                    }
                }
                else
                {
                    if ( !$elem.attr( 'href' ) )
                    {
                        // hide dropdown
                        $parent.removeClass( 'open' );
                    }
                }
            }

            // case 2: touch && ( md || lg ) -> open via 1st click on touch-desktop, return false (e.g. main navigation)

            if ( !alwaysClickable && ( Modernizr.touch && MediaSize.isInterval( 'md, lg' ) ) )
            {
                if ( !$parent.is( '.open' ) )
                {
                    showDropdownHideOthers( $elem, $parent );

                    avoidRedirectinStopPropagation( $parent );
                }
                else
                {
                    // redirect to href if dropdown is already open
                    // do nothing
                }
            }
        }

        function showDropdownHideOthers( elem, parent )
        {
            var $parent = $( parent );

            // hide other dropdowns
            resetDropdowns( closableDropdownElements, elem );

            // remember opened dropdown
            if ( $.inArray( $parent[0], closableDropdownElements ) < 0 )
            {
                closableDropdownElements.push( $parent[0] );
            }

            // show dropdown
            $parent.addClass( 'open' );
        }

        function avoidRedirectinStopPropagation( elem )
        {
            var $elem = $( elem );

            // avoid redirecting
            pm.getRecentEvent().preventDefault();

            // avoid closing popup by clicking itself
            $elem.off( 'click' );
            $elem.on( 'click', function( e )
            {
                e.stopPropagation();
            } );
        }

        function slideDropdown( elem )
        {
            var $elem       = $( elem );
            var $elemParent = $elem.parent();

            // size interval query is required since function is used on document ready to initial open active
            // navigation (on small devices)
            if ( MediaSize.isInterval( 'xs, sm' ) )
            {
                $elemParent.addClass( 'animating' );
                $elem.siblings( 'ul' ).slideToggle( 400, function()
                {
                    if ( $elemParent.is( '.open' ) )
                    {
                        $elemParent.removeClass( 'open' );
                    }
                    else
                    {
                        $elemParent.addClass( 'open' );
                        if ( $.inArray( $elemParent[0], dropdownElements ) < 0 )
                        {
                            dropdownElements.push( $elemParent[0] );
                        }
                    }
                    $elem.siblings( 'ul' ).removeAttr( 'style' );
                    $elemParent.removeClass( 'animating' );
                } );
            }
        }

    }, ['MediaSizeService'] );
}( jQuery, PlentyFramework ));