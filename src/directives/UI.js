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

        // resize elements on window size change.
        $( window ).on( 'sizeChange', function()
        {
            for ( var i = equalHeightElementList.length - 1; i >= 0; i-- )
            {
                equalHeight( equalHeightElementList[i], '', true );
            }
        } );

        return {
            addContentPageSlider: addContentPageSlider,
            equalHeight         : equalHeight,
            initToTop           : initToTop,
            initLazyload        : initLazyload,
            slideToggle         : slideToggle,
            toggleHideShow      : toggleHideShow,
            toggleSocialShare   : toggleSocialShare,
            toggleClass         : toggleClass
        };

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
            var $equalTargetList = $elem.find('[data-plenty-rel="equal-target"]').length > 0 ? $elem.find('[data-plenty-rel="equal-target"]') : $elem.children();
            var mediaSizeList    = mediaSizes.replace( /\s/g, '' ).split( ',' );

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

            if ( !mediaSizeList || $.inArray( MediaSizeService.interval(), mediaSizeList ) >= 0 )
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

            $( window ).on( "scroll resize", function()
            {
                if ( $( document ).scrollTop() > 100 )
                {
                    $elem.addClass( 'visible' );
                }
                else
                {
                    $elem.removeClass( 'visible' );
                }
            } );
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
        // TODO: test
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
                $elem.removeAttr( 'style' );
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
        // TODO: test
        function slideToggle( elem )
        {
            console.log( arguments );
            var $elem          = $( elem );
            var $targetElement = $( $elem.attr( 'data-plenty-target' ) );

            if ( $elem.is( 'input[type="radio"]' ) )
            {
                // is radio button
                var $radio           = $( 'input[type="radio"][name="' + ( $elem.attr( 'name' ) ) + '"]' );
                var visibleOnChecked = $elem.is( '[data-plenty-slidetoggle="checked"]' );
                $radio.change( function()
                {
                    $targetElement.parents( '[data-plenty-equal-target]' ).css( 'height', 'auto' );

                    if ( $( this ).is( ':checked' ) && $( this )[0] === $( elem )[0] )
                    {
                        // checked
                        if ( visibleOnChecked == true )
                        {
                            $targetElement.slideDown( 400, function()
                            {
                                pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                            } );
                        }
                        else
                        {
                            $targetElement.slideUp( 400, function()
                            {
                                pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                            } );
                        }
                    }
                    else
                    {
                        // unchecked (since other radio button has been checked)
                        if ( visibleOnChecked == true )
                        {
                            $targetElement.slideUp( 400, function()
                            {
                                pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                            } );
                        }
                        else
                        {
                            $targetElement.slideDown( 400, function()
                            {
                                pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                            } );
                        }
                    }
                } );
            }
            else
            {
                // is not radio button
                $elem.click( function()
                {
                    $targetElement.parents( '[data-plenty-equal-target]' ).css( 'height', 'auto' );

                    $elem.addClass( 'animating' );
                    $( $targetElement ).slideToggle( 400, function()
                    {
                        $elem.removeClass( 'animating' );
                        $elem.toggleClass( 'active' );
                        pm.getInstance().bindDirectives( '[data-plenty-equal]' );
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
        // TODO: test
        function toggleSocialShare( elem )
        {
            var $elem   = $( elem );
            var $toggle = $elem.find( '[data-plenty="switch"]' );

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
                    if ( $elem.attr( "data-toggle" ) == "tooltip" )
                    {
                        $elem.tooltip( 'destroy' )
                    }
                    $toggle.removeClass( 'off' ).addClass( 'on' );
                    // hide dummy button
                    $elem.find( '[data-plenty="placeholder"]' ).hide();
                    // load HTML defined in 'api'
                    $elem.find( '.social-container' ).append( SocialShareService.getSocialService( $elem.attr( 'data-plenty-social' ) ) );
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
            if( !!target && !!cssClass && ( !interval || MediaSizeService.isInterval(interval) ) )
            {
                var $elem = $( target );
                $elem.toggleClass( cssClass );
                return false;
            }
        }

    }, ['MediaSizeService', 'SocialShareService'] );
}( jQuery, PlentyFramework ));