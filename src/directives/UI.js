(function( $, pm )
{
    pm.directive( 'UI', function( MediaSizeService, SocialShareService )
    {
        // elements to calculate height.
        var equalHeightElements = [];

        // resize elements on window size change.
        $( window ).on( 'sizeChange', function()
        {
            for ( var i = equalHeightElements.length; i >= 0; i-- )
            {
                equalHeight( equalHeightElements[i], true );
            }
        } );

        return {
            setTooltip          : setTooltip,
            addContentPageSlider: addContentPageSlider,
            equalHeight         : equalHeight,
            initToTop           : initToTop,
            initLazyload        : initLazyload,
            slideToggle         : slideToggle,
            toggleHideShow      : toggleHideShow,
            toggleSocialShare   : toggleSocialShare,
            toggleCssClass      : toggleCssClass,
            openTab             : openTab,
            openRemoteTab       : openRemoteTab,
            setRemoteTab        : setRemoteTab
        };

        function setTooltip( elem )
        {
            $( elem ).tooltip( {
                container: 'body'
            } );
        }

        /*
         * content page slider
         *
         * usage (functionality requires only attribute data-plenty="contentpageSlider"):
         * <div class="contentpageSlider" data-plenty="contentpageSlider">
         *     <div class="slide">
         *         ...
         *     </div>
         *     <div class="slide">
         *         ...
         *     </div>
         *     ...
         * </div>
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
                    $( current ).find( 'img[data-plenty-lazyload]' ).trigger( 'appear' );
                }
            } );
        }

        /**
         * Equal Box heights
         *
         * @param elem
         * @param elementExists - default false
         */
        function equalHeight( elem, elementExists )
        {
            var cachedElement = $( elem );
            var maxHeight = 0;
            var cachedChild = {};

            var equalTarget = cachedElement.find( '[data-plenty-equal-target]' ) || cachedElement.children();
            var mediaSizes = cachedElement.data( 'plenty-equal' ).replace( /\s/g, '' ).split( ',' );

            // if element wasn't pushed before.
            if ( !elementExists )
            {
                equalHeightElements.push( elem );
            }

            for (var i = equalTarget.length; i >= 0; i--) {
                cachedChild = $( equalTarget[i] );
                cachedChild.css( 'height', '' );

                if ( cachedChild.outerHeight( true ) > maxHeight )
                {
                    maxHeight = cachedChild.outerHeight( true );
                }
            }

            if ( !mediaSizes || $.inArray( MediaSizeService.interval(), mediaSizes ) >= 0 )
            {
                equalTarget.height( maxHeight );
            }
        }

        /**
         * Scroll page to top on click.
         * Just add without events.
         *
         * @param elem
         */
        function initToTop( elem )
        {
            $( elem ).click( function()
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
                    $( elem ).addClass( 'visible' );
                }
                else
                {
                    $( elem ).removeClass( 'visible' );
                }
            } );
        }

        /**
         * lazy load on ready.
         *
         * @param elem
         */
        function initLazyload( elem )
        {
            $( elem ).lazyload( {
                effect: $( this ).attr( 'data-plenty-lazyload' )
            } );
            $( elem ).on( "loaded", function()
            {
                $( elem ).css( 'display', 'inline-block' );
            } );
        }

        function toggleHideShow( elem )
        {
            $( elem ).parent().addClass( 'animating' );
            $( elem ).siblings( 'ul' ).slideToggle( 200, function()
            {
                if ( $( elem ).parent().is( '.open' ) )
                {
                    $( elem ).parent().removeClass( 'open' );
                }
                else
                {
                    $( elem ).parent().addClass( 'open' );
                }
                $( elem ).removeAttr( 'style' );
                $( elem ).parent().removeClass( 'animating' );
            } );
        }

        function slideToggle( elem )
        {
            var target = $( $( elem ).attr( 'data-plenty-target' ) );

            if ( $( elem ).is( 'input[type="radio"]' ) )
            {
                // is radio button
                var radioList        = $( 'input[type="radio"][name="' + ( $( elem ).attr( 'name' ) ) + '"]' );
                var visibleOnChecked = $( elem ).is( '[data-plenty-slidetoggle="checked"]' );
                $( radioList ).change( function()
                {
                    $( target ).parents( '[data-plenty-equal-target]' ).css( 'height', 'auto' );

                    if ( $( this ).is( ':checked' ) && $( this )[0] === $( elem )[0] )
                    {
                        // checked
                        if ( visibleOnChecked == true )
                        {
                            $( target ).slideDown( 400, function()
                            {
                                pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                            } );
                        }
                        else
                        {
                            $( target ).slideUp( 400, function()
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
                            $( target ).slideUp( 400, function()
                            {
                                pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                            } );
                        }
                        else
                        {
                            $( target ).slideDown( 400, function()
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
                $( elem ).click( function()
                {
                    $( target ).parents( '[data-plenty-equal-target]' ).css( 'height', 'auto' );

                    $( elem ).addClass( 'animating' );
                    $( target ).slideToggle( 400, function()
                    {
                        $( elem ).removeClass( 'animating' );
                        $( elem ).toggleClass( 'active' );
                        pm.getInstance().bindDirectives( '[data-plenty-equal]' );
                    } );
                } );
            }
        }

        /**
         * Social Share Activation
         * Activate and load share-buttons manually by clicking a separate button
         * Usage / data-attributes:
         * <div data-plenty-social="twitter">
         *    <span data-plenty="switch"></span>                Will be used to activate the service set in
         * data-plenty-social=""
         *        <span data-plenty="placeholder"></span>        Will be replaced with loaded share button
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
         * @param elem
         */
        function toggleSocialShare( elem )
        {
            var toggle = $( elem ).find( '[data-plenty="switch"]' );

            // append container to put / delete service.html
            $( elem ).append( '<div class="social-container"></div>' );

            // add "off" class to switch, if neither "off" or "on" is set
            if ( !toggle.hasClass( 'off' ) && !toggle.hasClass( 'on' ) )
            {
                toggle.addClass( 'off' );
            }

            // toggle switch
            toggle.on( 'click', function()
            {
                if ( toggle.hasClass( 'off' ) )
                {
                    if ( $( elem ).attr( "data-toggle" ) == "tooltip" )
                    {
                        $( elem ).tooltip( 'destroy' )
                    }
                    ;
                    toggle.removeClass( 'off' ).addClass( 'on' );
                    // hide dummy button
                    $( elem ).find( '[data-plenty="placeholder"]' ).hide();
                    // load HTML defined in 'api'
                    $( elem ).find( '.social-container' ).append( SocialShareService.getSocialService( $( elem ).attr( 'data-plenty-social' ) ) );
                }
                // do not disable social medias after activation
            } );
        }

        /**
         * Tab Handling
         *
         * Show tab with jQuery-selector 'TAB_SELECTOR'
         * <a data-plenty-opentab="TAB_SELECTOR">
         * (!) Requires bootstrap.js
         *
         * @param elem
         */
        function openTab( elem )
        {
            var tabSelector = $( elem ).attr( 'data-plenty-opentab' );
            tabSelector     = ( tabSelector == 'href' ) ? $( this ).attr( 'href' ) : tabSelector;
            $( tabSelector ).tab( 'show' );
        }

        /**
         * Show remote tab with jQuery-selector 'TAB_1' in target container (below)
         * <span data-plenty-openremotetab="TAB_1">
         *
         * @param elem
         */
        function openRemoteTab( elem )
        {
            var tabSelector = $( elem ).attr( 'data-plenty-openremotetab' );
            $( tabSelector ).trigger( 'tabchange' );
        }

        function setRemoteTab( elem )
        {
            var tabsId = $( elem ).attr( 'data-plenty-remotetabs-id' );

            // find tabs grouped by remotetabs-id
            $( '[data-plenty="remoteTabs"][data-plenty-remotetabs-id="' + tabsId + '"]' ).each( function( i, tabs )
            {

                // bind each remote-tab
                $( tabs ).find( 'a' ).each( function( i, singleTab )
                {

                    var singleTabId = $( singleTab ).attr( 'data-plenty-tab-id' );

                    // listen to 'tabchange' event
                    $( singleTab ).on( 'tabchange', function()
                    {
                        // toggle class 'active'
                        $( singleTab ).closest( '[data-plenty="remoteTabs"]' ).children( '.active' ).removeClass( 'active' );
                        $( singleTab ).closest( 'li' ).addClass( 'active' );

                        // hide inactive tabs & show active tab
                        var tabpanelsInactive     = $( '[data-plenty-remotetabs-id="' + tabsId + '"][data-plenty-tabpanel-labelledby]' ).not( '[data-plenty-tabpanel-labelledby="' + singleTabId + '"]' );
                        var tabpanelActive        = $( '[data-plenty-remotetabs-id="' + tabsId + '"][data-plenty-tabpanel-labelledby="' + singleTabId + '"]' );
                        var zIndexTabpanelParents = 0;
                        if ( $( tabs ).attr( 'data-plenty-remotetabs-adapt' ) == 'tabpanel-parent' )
                        {
                            zIndexTabpanelParents = 2147483646;
                            $( '[data-plenty-remotetabs-id="' + tabsId + '"][data-plenty-tabpanel-labelledby]' ).parent().each( function()
                            {
                                var zIndexCurrent = parseInt( $( this ).css( 'zIndex' ) );
                                if ( typeof zIndexCurrent == 'number' && zIndexCurrent < zIndexTabpanelParents )
                                {
                                    zIndexTabpanelParents = zIndexCurrent;
                                }
                            } );
                        }

                        // adjust z-index if neccessary
                        $( tabpanelsInactive ).hide().removeClass( 'in' );
                        $( tabpanelActive ).show().addClass( 'in' );
                        if ( zIndexTabpanelParents != 0 )
                        {
                            $( tabpanelsInactive ).parent().css( 'zIndex', zIndexTabpanelParents );
                            $( tabpanelActive ).parent().css( 'zIndex', zIndexTabpanelParents + 1 );
                        }
                    } );
                } );
            } );

            // trigger 'tabchange' event
            $( elem ).find( 'a' ).click( function()
            {
                $( this ).trigger( 'tabchange' );
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
         * @param elem
         */
        function toggleCssClass( elem )
        {
            if ( $( elem ).attr( 'data-plenty-toggle' ).search( ';' ) < 0 )
            {
                eval( 'var data = ' + $( elem ).attr( 'data-plenty-toggle' ) );
                if ( data.target && data.class )
                {
                    $( elem ).click( function()
                    {
                        var isMedia = false;
                        if ( data.media )
                        {
                            if ( data.media.indexOf( ' ' ) != -1 )
                            {
                                var mediaArr = data.media.split( ' ' );
                                for ( i = 0; i < mediaArr.length; i++ )
                                {
                                    if ( MediaSizeService.interval() == mediaArr[i] )
                                    {
                                        isMedia = true;
                                    }
                                }
                            }
                            else
                            {
                                if ( MediaSizeService.interval() == data.media )
                                {
                                    isMedia = true;
                                }
                            }
                        }
                        if ( !data.media || isMedia == true )
                        {
                            $( data.target ).toggleClass( data.class );
                            if ( $( elem ).is( 'a' ) )
                            {
                                return false;
                            }
                        }
                    } );
                }
            }
        }

    }, ['MediaSizeService', 'SocialShareService'] );
}( jQuery, PlentyFramework ));