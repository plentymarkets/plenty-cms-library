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
            openDropdown: openDropdown,
            slideDropdown: slideDropdown
        };

        function initDropdowns()
        {
            $(window).on('orientationchange sizeChange', function() {
                resetDropdowns( dropdownElements );
            });

            $( 'html' ).click( function( e ) {
                resetDropdowns( closableDropdownElements );
            });
        }

        function resetDropdowns( dropdownList )
        {

            for( var i = 0; i < dropdownList.length; i++ )
            {
                $( dropdownList[i] ).removeClass('open');
            }

        }

        function openDropdown( elem, closable )
        {

            var $elem = $( elem );
            var $parent = $elem.parent();

            if( Modernizr.touch )
            {
                if ( MediaSize.isInterval('md, lg') && !$parent.is( '.open' ) )
                {

                    // avoid redirecting
                    pm.getRecentEvent().preventDefault();

                    // hide other dropdowns
                    resetDropdowns( dropdownElements );

                    // show dropdown
                    $parent.addClass( 'open' );

                    if ( $.inArray( $parent[0], dropdownElements ) < 0 )
                    {
                        dropdownElements.push( $parent[0] );
                    }

                    if ( !!closable && $.inArray( $parent[0], closableDropdownElements ) < 0 )
                    {
                        closableDropdownElements.push( $parent[0] );
                    }

                    // avoid closing popup by clicking itself
                    $parent.off( 'click' );
                    $parent.on( 'click', function( e )
                    {
                        e.stopPropagation();
                    } );
                }

            }
            else
            {
                // redirect to href
                // do nothing
            }

        }

        function slideDropdown( elem )
        {
            var $elem = $( elem );
            var $elemParent = $elem.parent();

            $elemParent.addClass( 'animating' );
            $elem.siblings( 'ul' ).slideToggle( 200, function()
            {
                if ( $elemParent.is( '.open' ) )
                {
                    $elemParent.removeClass( 'open' );
                }
                else
                {
                    $elemParent.addClass( 'open' );
                    if( $.inArray( $elemParent[0], dropdownElements) < 0 )
                    {
                        dropdownElements.push( $elemParent[0] );
                    }
                }
                $elem.siblings( 'ul' ).removeAttr( 'style' );
                $elemParent.removeClass( 'animating' );
            } );
        }

    }, ['MediaSizeService'] );
}( jQuery, PlentyFramework ));