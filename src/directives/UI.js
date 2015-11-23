/**
 * Add fancy ui modifications - the visual stuff - here.
 * Respond functionality like 'event':UI.myFunctionality(currentElement)
 *
 * Example:
 *      <button type="button" data-plenty="click:UI.addTooltip(this)">go to top</button>
 *
 */
(function( $, pm )
{
    pm.directive( 'UI', function( MediaSizeService, SocialShareService )
    {
        // elements to calculate height.
        var equalHeightElementList = [];
        var toTopButtonList        = [];

        return {
            initUIWindowEvents  : initUIWindowEvents,
            addContentPageSlider: addContentPageSlider,
            equalHeight         : equalHeight,
            initToTop           : initToTop,
            initLazyload        : initLazyload,
            initSlideToggle     : initSlideToggle,
            toggleHideShow      : toggleHideShow,
            toggleSocialShare   : toggleSocialShare,
            toggleClass         : toggleClass
        };

        function initUIWindowEvents()
        {
            // resize elements on window size change.
            $( window ).on( 'sizeChange contentChanged', function()
            {
                fireEqualHeight();
            } );

            $( window ).on( "scroll resize", function()
            {
                if ( toTopButtonList.length > 0 )
                {
                    if ( $( document ).scrollTop() > 100 )
                    {
                        doToArrayElements( toTopButtonList, "addClass", "visible" );
                    }
                    else
                    {
                        doToArrayElements( toTopButtonList, "removeClass", "visible" );
                    }
                }
            } );
        }

        /**
         * Adds content page slider (owlCarousel)
         *
         * usage:
         * <div class="contentpageSlider" data-plenty="contentpageSlider">
         *     <div class="slide">
         *         ...
         *     </div>
         *     <div class="slide">
         *         ...
         *     </div>
         *     ...
         * </div>
         *
         * Legacy directive selector: data-plenty="contentpageSlider"
         *
         * @param elem
         */
        function addContentPageSlider( elem )
        {
            $( elem ).owlCarousel( {
                navigation     : true,
                navigationText : false,
                slideSpeed     : 1000,
                paginationSpeed: 1000,
                singleItem     : true,
                autoPlay       : 6000,
                stopOnHover    : true,
                afterMove      : function( current )
                {
                    $( current ).find( 'img[data-plenty-rel="lazyload"]' ).trigger( 'appear' );
                }
            } );
        }

        /**
         * Equal Box height
         * Calculates equal box height for chosen elements.
         *
         * Legacy directive selector: data-plenty-equal
         *
         * @param elem
         * @param elementExists - default false
         */
        function equalHeight( elem, mediaSizes, elementExists )
        {
            var $elem            = $( elem );
            var maxHeight        = 0;
            var $equalTarget     = {};
            var $equalTargetList = $elem.find( '[data-plenty-rel="equal-target"]' ).length > 0 ? $elem.find( '[data-plenty-rel="equal-target"]' ) : $elem.children();

            // if element wasn't pushed before.
            if ( elementExists !== true )
            {
                equalHeightElementList.push( elem );
            }

            for ( var i = $equalTargetList.length; i >= 0; i-- )
            {
                $equalTarget = $( $equalTargetList[i] );
                $equalTarget.css( 'height', '' );

                if ( $equalTarget.outerHeight( true ) > maxHeight )
                {
                    maxHeight = $equalTarget.outerHeight( true );
                }
            }

            if ( !mediaSizes || MediaSizeService.isInterval( mediaSizes ) )
            {
                $equalTargetList.height( maxHeight );
            }
        }

        /**
         * Scroll page to top.
         * Just add without events.
         *
         * Legacy directive selector: data-plenty="toTop"
         *
         * @param elem
         */
        function initToTop( elem )
        {
            var $elem = $( elem );

            $elem.click( function()
            {
                $( 'html, body' ).animate( {
                    scrollTop: 0
                }, 400 );
                return false;
            } );

            if ( !!$.inArray( $elem, toTopButtonList ) )
            {
                toTopButtonList.push( $elem );
            }
        }

        /**
         * lazy load on ready.
         *
         * Legacy directive selector: img[data-plenty-lazyload]
         *
         * @param elem
         */
        function initLazyload( elem, effect )
        {
            var $elem = $( elem );

            $elem.lazyload( {
                effect: effect
            } );
            $elem.on( "loaded", function()
            {
                $elem.css( 'display', 'inline-block' );
            } );
        }

        /**
         * Toggle show and hide animation.
         *
         * Legacy directive selector: data-plenty="openCloseToggle"
         *
         * @param elem
         */
        function toggleHideShow( elem )
        {
            var $elem       = $( elem );
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
                }
                $elem.siblings( 'ul' ).removeAttr( 'style' );
                $elemParent.removeClass( 'animating' );
            } );
        }

        /**
         * Toggle target content on click.
         * Bind to checked-/ unchecked-property of radio buttons
         *
         * Legacy directive selector: data-plenty-slidetoggle
         *
         * @param elem
         */
        function initSlideToggle( elem, checked )
        {
            var $elem          = $( elem );
            var $targetElement = $( $elem.attr( 'data-plenty-rel' ) );

            if ( $elem.is( 'input[type="radio"]' ) )
            {
                // is radio button
                var $radioGroupList  = $( 'input[type="radio"][name="' + ( $elem.attr( 'name' ) ) + '"]' );
                var visibleOnChecked = !checked || checked == 'checked';

                $radioGroupList.change( function()
                {
                    var $self = $( this );
                    $targetElement.parents( '[data-plenty-rel="equal-target"]' ).css( 'height', 'auto' );

                    if ( $self.is( ':checked' ) && $self[0] === $elem[0] && visibleOnChecked == true )
                    {
                        // checked
                        $targetElement.slideDown( 400, function()
                        {
                            fireEqualHeight();
                        } );
                    }
                    else
                    {
                        // unchecked (since other radio button has been checked)
                        $targetElement.slideUp( 400, function()
                        {
                            fireEqualHeight();
                        } );
                    }
                } );
            }
            else
            {
                // is not radio button
                $elem.click( function()
                {
                    //$targetElement.parents( '[data-plenty-rel="equal-target"]' ).css( 'height', 'auto' );

                    $elem.addClass( 'animating' );
                    $targetElement.slideToggle( 400, function()
                    {
                        $elem.removeClass( 'animating' );
                        $elem.toggleClass( 'active' );
                        fireEqualHeight();
                    } );
                } );
            }
        }

        /**
         * TODO check comment
         * Social Share Activation
         * Activate and load share-buttons manually by clicking a separate button
         * Usage / data-attributes:
         * <div data-plenty-social="twitter">
         *    <span data-plenty="switch"></span>        Will be used to activate the service set in
         * data-plenty-social=""
         *    <span data-plenty="placeholder"></span>   Will be replaced with loaded share button
         * </div>
         *
         * possible values for data-plenty-social:
         * "facebook-like"            : Load Facebooks "Like"-Button
         * "facebook-recommend"        : Load Facebooks "Recommend"-Button
         * "twitter"                : Load Twitter Button
         * "google-plus"            : Load google "+1"-Button
         *
         * Additional Tooltips
         * You can extend the parent element with a (bootstrap) tooltip by adding data-toggle="tooltip" and
         * title="TOOLTIP CONTENT" Tooltip will be destroyed after activating a social service
         * (!) Requires bootstrap.js
         *
         * Legacy directive selector: data-plenty-social
         *
         * @param elem
         */
        function toggleSocialShare( elem, socialShareService )
        {
            var $elem   = $( elem );
            var $toggle = $elem.find( '[data-plenty-rel="social-switch"]' );

            // append container to put / delete service.html
            $elem.append( '<div class="social-container"></div>' );

            // add "off" class to switch, if neither "off" or "on" is set
            // replaced hasClass() with is() benchmark: http://jsperf.com/hasclasstest
            if ( !$toggle.is( 'off, on' ) )
            {
                $toggle.addClass( 'off' );
            }

            // toggle switch
            $toggle.on( 'click', function()
            {
                if ( $toggle.hasClass( 'off' ) )
                {
                    // TODO remove bootstrap dependency
                    if ( $elem.attr( "data-toggle" ) == "tooltip" )
                    {
                        $elem.tooltip( 'destroy' )
                    }
                    $toggle.removeClass( 'off' ).addClass( 'on' );
                    // hide dummy button
                    $elem.find( '[data-plenty-rel="social-placeholder"]' ).hide();
                    // load HTML defined in 'api'
                    $elem.find( '.social-container' ).append( SocialShareService.getSocialService( socialShareService ) );
                }
                // do not disable social medias after activation
            } );
        }

        /**
         * Toggle Class
         * toggle style-classes on click
         * Usage / data-attribute:
         * <div data-plenty-toggle="{target: 'body', class: 'toggledClass', media: 'xs sm'}"></div>
         * target    :    jQuery selector to toggle the class at.
         * class        :  class(es) to toggle at target element
         * media        :  only toggle class on given media sizes (optional)
         *
         * (!) using data-plenty-toggle on <a>-elements will prevent redirecting to href=""
         *
         * Legacy directive selector: data-plenty-toggle
         *
         * @param cssClass
         * @param target
         * @param interval
         */
        function toggleClass( cssClass, target, interval )
        {
            if ( !!target && !!cssClass && ( !interval || MediaSizeService.isInterval( interval ) ) )
            {
                var $elem = $( target );
                $elem.toggleClass( cssClass );
                return false;
            }
        }

        /*
         ##### PRIVATE FUNCTIONS ######
         */

        function fireEqualHeight()
        {
            for ( var i = equalHeightElementList.length - 1; i >= 0; i-- )
            {
                equalHeight( equalHeightElementList[i], '', true );
            }
        }

        function doToArrayElements( array, func, params )
        {
            for ( var i = array.length - 1; i >= 0; i-- )
            {
                array[i][func]( params );
            }
        }

    }, ['MediaSizeService', 'SocialShareService'] );
}( jQuery, PlentyFramework ));