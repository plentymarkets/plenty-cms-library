(function($, pm){

    /****************************************
     *              GUI HANDLING            *
     ****************************************/
    pm.service('NavigatorService', function() {

        var navigation  = [];		// contains navigation list elements
        var container   = [];		// content containers
        var current     = -1;		// index of currently shown content container
        var buttonPrev  = {};		// navigation buttons
        var buttonNext  = {};
        var interceptors = {
                beforeChange: [],
                afterChange: []
            };

        return {
            init: init,
            getCurrentContainer: getCurrentContainer,
            goTo: goTo,
            beforeChange: beforeChange,
            afterChange: afterChange,
            continueChange: continueChange,
            next: next,
            previous: previous,
            goToID: goToID,
            fillNavigation: fillNavigation
        };

        function init() {
            // get elements from DOM
            navigation 	= 	$('[data-plenty-checkout="navigation"] > li');
            container 	= 	$('[data-plenty-checkout="container"] > div');
            buttonNext 	=	$('[data-plenty-checkout="next"]');
            buttonPrev 	=	$('[data-plenty-checkout="prev"]');

            if( navigation.length == container.length && container.length > 0 ) {
                container.hide();

                // initialize navigation
                navigation.each(function(i, elem) {
                    $(elem).addClass('disabled');
                    // handle navigation click events
                    $(elem).click(function() {
                        if( !$(this).is('.disabled') ) {
                            goTo( i );
                        }
                    });
                });

                buttonNext.attr("disabled", "disabled");
                buttonNext.click(function() {
                    next();
                });

                buttonPrev.attr("disabled", "disabled");
                buttonPrev.click(function() {
                    previous();
                });

                window.addEventListener('hashchange', function() {
                    if( window.location.hash.length > 0 ) {
                        goToID(window.location.hash);
                    } else {
                        goTo(0);
                    }
                }, false);

                // initialize GUI
                // check url param for jumping to tab
                $.urlParam = function(name) {
                    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
                    if ( results == null ) {
                        return null;
                    }
                    else {
                        return results[1] || 0;
                    }
                };

                var param = $.urlParam('gototab');
                // jump to hash from url param 'gototab'
                if ( window.location.hash.length == 0 && !! param && $('[data-plenty-checkout-id="'+param+'"]').length > 0 ) {
                    window.location.hash = param;
                }
                // jump to hash
                else if( !goToID(window.location.hash) && current >= 0 ) {
                    goTo(current);
                } else {
                    goTo(0);
                }


                fillNavigation();
                $(window).on('sizeChange', fillNavigation);
                $(window).resize(function() {
                    if(pm.getInstance().MediaSizeService.interval() == 'xs') {
                        fillNavigation();
                    }
                });

            }
        }

        function getCurrentContainer() {
            if (current >= 0) {
                return {
                    id: $(container[current]).attr('data-plenty-checkout-id'),
                    index: current
                };
            } else {
                return null;
            }
        }

        function beforeChange( interceptor ) {
            interceptors.beforeChange.push( interceptor );
            return pm.getInstance().Navigator;
        }

        function afterChange( interceptor ) {
            interceptors.afterChange.push( interceptor );
            return pm.getInstance().Navigator;
        }

        function resolveInterceptors( identifier, params ) {
            var continueTabChange = true;

            if( !!interceptors ) {
                $.each(interceptors[identifier], function (i, interceptor) {
                    if (interceptor(params) === false) {
                        continueTabChange = false;
                        return false
                    }
                });
            }

            return continueTabChange;
        }

        /**
         * Show checkout tab given by index
         * @param index Index of target tab, starting at 0
         */
        function goTo(index, ignoreInterceptors) {

            var targetContainer = {
                index: index,
                id: $(container[index]).attr('data-plenty-checkout-id')
            };

            var contentChanged = current !== index

            if( contentChanged && !ignoreInterceptors ) {
                if( !resolveInterceptors( "beforeChange", targetContainer ) ) {
                    return;
                }
            }

            current = index;

            // hide content containers
            $(container).hide();

            // refresh navigation elements
            $(navigation).each(function (i, elem) {
                $(elem).removeClass('disabled active');
                $(elem).find('[role="tab"]').attr('aria-selected', 'false');

                if (i < current) {
                    // set current element as active
                    $(elem).addClass('visited');
                }
                else {
                    if (i == current) {
                        $(elem).addClass('active visited');
                        $(elem).find('[role="tab"]').attr('aria-selected', 'true');
                    }
                    else {
                        if (i > current && !$(elem).is('.visited')) {
                            // disable elements behind active
                            $(elem).addClass('disabled');
                        }
                    }
                }
            });
            fillNavigation();

            // hide "previous"-button if first content container is shown
            if (current <= 0) {
                $(buttonPrev).attr("disabled", "disabled");
            } else {
                $(buttonPrev).removeAttr("disabled");
            }

            // hide "next"-button if last content container is shown
            if (current + 1 == navigation.length) {
                $(buttonNext).attr("disabled", "disabled");
            }
            else {
                $(buttonNext).removeAttr("disabled");
            }

            // show current content container
            $(container[current]).show();

            // set location hash
            if (current > 0) {
                window.location.hash = $(container[current]).attr('data-plenty-checkout-id');
            }
            else {
                if (window.location.hash.length > 0) {
                    window.location.hash = '';
                }
            }

            if( contentChanged ) {
                resolveInterceptors("afterChange", targetContainer);
            }

        }

        function continueChange(targetContainer) {
            goTo(targetContainer.index, true);
        }

        /**
         * Show next checkout tab if available
         */
        function next() {
            if (current < navigation.length - 1) {
                goTo(current + 1);
            }
        }

        /**
         * Show previous checkout tab if available
         */
        function previous() {
            if (current > 0) {
                goTo(current - 1);
            }
        }

        /**
         * Show checkout tab given by ID
         * @param    containerID    ID of tab to show. Target tab must be marked with data-plenty-checkout-id="#..."
         */
        function goToID(containerID) {
            if (containerID == 'next') {
                next();
                return true;
            }
            else if (containerID == 'prev') {
                previous();
                return true;
            }
            else {
                containerID = containerID.replace('#', '');
                $(container).each(function (i, elem) {
                    if ($(elem).attr('data-plenty-checkout-id') == containerID) {
                        goTo(i);
                        return true;
                    }
                });
            }

            return false;
        }

        /**
         * Calculate checkout navigations width to match its parent element
         * by increasing its items padding
         */
        function fillNavigation() {
            // break if manager has not been inizialized
            if( navigation.length <= 0 ) {
                return;
            }

            // set equal button width
            $(buttonNext).css('width', 'auto');
            $(buttonPrev).css('width', 'auto');
            var buttonWidth = ($(buttonPrev).outerWidth() < $(buttonNext).outerWidth()) ? $(buttonNext).outerWidth(true) + 1 : $(buttonPrev).outerWidth(true) + 1;
            $(buttonNext).width(buttonWidth);
            $(buttonPrev).width(buttonWidth);

            // calculate width to fill
            var width = $(navigation).parent().parent().outerWidth(true) - (2 * buttonWidth);

            width -= parseInt($(navigation).parent().css('marginLeft')) + parseInt($(navigation).parent().css('marginRight'));

            $(navigation).each(function (i, elem) {
                width -= $(elem).children('span').width();
            });

            var padding = parseInt(width / ($(navigation).length * 2));
            var diff = width - ($(navigation).length * padding * 2);

            $(navigation).each(function (i, elem) {
                var paddingLeft = padding;
                var paddingRight = padding;
                if (diff > 0) {
                    paddingLeft++;
                    diff--;
                }
                if (diff > 0) {
                    paddingRight++;
                    diff--;
                }
                $(elem).children('span').css('paddingLeft', paddingLeft + 'px').css('paddingRight', paddingRight + 'px');
            });
        }

/*
        new PlentyFunction('[data-plenty-checkout-href]', );
*/

    });

}(jQuery, PlentyFramework));