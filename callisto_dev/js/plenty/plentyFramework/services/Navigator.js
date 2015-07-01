(function(pm){

    /****************************************
     *              GUI HANDLING            *
     ****************************************/
    pm.service('Navigator', function() {

        /**
         * Initialize checkout navigation
         */
        (function init() {
            var self = this;
            // get elements from DOM
            this.navigation = $('[data-plenty-checkout="navigation"] > li');
            this.container = $('[data-plenty-checkout="container"] > div');
            this.buttonNext = $('[data-plenty-checkout="next"]');
            this.buttonPrev = $('[data-plenty-checkout="prev"]');

            if (this.navigation.length == this.container.length && this.container.length > 0) {

                this.container.hide();

                // initialize navigation
                this.navigation.each(function (i, elem) {
                    $(elem).addClass('disabled');
                    // handle navigation click events
                    $(elem).click(function () {
                        if (!$(this).is('.disabled')) {
                            self.goTo(i);
                        }
                    });
                });

                this.buttonNext.attr("disabled", "disabled");
                this.buttonNext.click(function () {
                    self.next();
                });

                this.buttonPrev.attr("disabled", "disabled");
                this.buttonPrev.click(function () {
                    self.previous();
                });

                window.addEventListener('hashchange', function () {
                    if (window.location.hash.length > 0) {
                        CheckoutManager.Navigator.goToID(window.location.hash);
                    }
                    else {
                        goTo(0);
                    }
                }, false);

                // initialize GUI
                // check url param for jumping to tab
                $.urlParam = function (name) {
                    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
                    if (results == null) {
                        return null;
                    }
                    else {
                        return results[1] || 0;
                    }
                }
                var param = $.urlParam('gototab');
                // jump to hash from url param 'gototab'
                if (window.location.hash.length == 0 && !!param && $('[data-plenty-checkout-id="' + param + '"]').length > 0) {
                    window.location.hash = param;
                }
                // jump to hash
                else {
                    if (!this.goToID(window.location.hash) && this.current >= 0) {
                        this.goTo(this.current);
                    }
                    else {
                        this.goTo(0);
                    }
                }

            }
        })();

        return {
            navigation: [],		// contains navigation list elements
            container: [],		// content containers
            current: -1,		// index of currently shown content container
            buttonPrev: {},		// navigation buttons
            buttonNext: {},
            getCurrentContainer: getCurrentContainer,
            goTo: goTo,
            continueChange: continueChange,
            next: next,
            previous: previous,
            goToID: goToID,
            fillNavigation: fillNavigation,
        }

        function getCurrentContainer() {
            if (this.current >= 0) {
                return {
                    id: $(this.container[this.current]).attr('data-plenty-checkout-id'),
                    index: this.current
                };
            }
            else {
                return null;
            }
        }

        /**
         * Show checkout tab given by index
         * @param index Index of target tab, starting at 0
         */
        function goTo(index, ignoreInterceptors) {
            var contentChanged = this.current != index;
            var continueTabChange = true;
            if (contentChanged && !ignoreInterceptors) {
                continueTabChange = $(this).triggerHandler("beforeChange", {
                    index: index,
                    id: $(this.container[index]).attr('data-plenty-checkout-id')
                });
            }
            if (!continueTabChange) {
                return;
            }

            var self = this;
            this.current = index;

            // hide content containers
            $(this.container).hide();

            // refresh navigation elements
            $(this.navigation).each(function (i, elem) {
                $(elem).removeClass('disabled active');
                $(elem).find('[role="tab"]').attr('aria-selected', 'false');

                if (i < self.current) {
                    // set current element as active
                    $(elem).addClass('visited');
                }
                else {
                    if (i == self.current) {
                        $(elem).addClass('active visited');
                        $(elem).find('[role="tab"]').attr('aria-selected', 'true');
                    }
                    else {
                        if (i > self.current && !$(elem).is('.visited')) {
                            // disable elements behind active
                            $(elem).addClass('disabled');
                        }
                    }
                }
            });
            this.fillNavigation();

            // hide "previous"-button if first content container is shown
            if (this.current <= 0) {
                $(this.buttonPrev).attr("disabled", "disabled");
            }
            else {
                $(this.buttonPrev).removeAttr("disabled");
            }

            // hide "next"-button if last content container is shown
            if (this.current + 1 == this.navigation.length) {
                $(this.buttonNext).attr("disabled", "disabled");
            }
            else {
                $(this.buttonNext).removeAttr("disabled");
            }

            // show current content container
            $(this.container[this.current]).show();

            // set location hash
            if (this.current > 0) {
                window.location.hash = $(this.container[this.current]).attr('data-plenty-checkout-id');
            }
            else {
                if (window.location.hash.length > 0) {
                    window.location.hash = '';
                }
            }

            if (contentChanged) {
                $(this).triggerHandler("afterChange", {
                    index: index,
                    id: $(this.container[index]).attr('data-plenty-checkout-id')
                });
            }
        }

        function continueChange(targetContainer) {
            goTo(targetContainer.index, true);
        }

        /**
         * Show next checkout tab if available
         */
        function next() {
            if (this.current == 2)//todo, refactor
            {
                //prepare payment
                CheckoutManager.showWaitScreen();
                return $.ajax(
                    "/rest/checkout/preparepayment/",
                    {
                        data: null,
                        dataType: 'json',
                        type: 'POST',
                        success: function (response) {
                            if (response.data.CheckoutMethodOfPaymentRedirectURL != '') {
                                document.location.href = response.data.CheckoutMethodOfPaymentRedirectURL;
                            }
                            else {
                                CheckoutManager.hideWaitScreen();
                                if (CheckoutManager.Navigator.current < CheckoutManager.Navigator.navigation.length - 1) {
                                    goTo(CheckoutManager.Navigator.current + 1);
                                }
                            }
                        },
                        error: CheckoutManager.handleError
                    }
                );
            }
            else {
                if (this.current < this.navigation.length - 1) {
                    this.goTo(this.current + 1);
                }
            }
        }

        /**
         * Show previous checkout tab if available
         */
        function previous() {
            if (this.current > 0) {
                this.goTo(this.current - 1);
            }
        }

        /**
         * Show checkout tab given by ID
         * @param    containerID    ID of tab to show. Target tab must be marked with data-plenty-checkout-id="#..."
         */
        function goToID(containerID) {
            var self = this;
            if (containerID == 'next') {
                this.next();
                return true;
            }
            else {
                if (containerID == 'prev') {
                    this.previous();
                    return true;
                }
                else {
                    containerID = containerID.replace('#', '');
                    $(this.container).each(function (i, elem) {
                        if ($(elem).attr('data-plenty-checkout-id') == containerID) {
                            self.goTo(i);
                            return true;
                        }
                    });
                }
            }
            return false;
        }

        /**
         * Calculate checkout navigations width to match its parent element
         * by increasing its items padding
         */
        function fillNavigation() {
            // break if manager has not been inizialized
            if (this.navigation.length <= 0) {
                return;
            }

            // set equal button width
            $(this.buttonNext).css('width', 'auto');
            $(this.buttonPrev).css('width', 'auto');
            var buttonWidth = ($(this.buttonPrev).outerWidth() < $(this.buttonNext).outerWidth()) ? $(this.buttonNext).outerWidth(true) + 1 : $(this.buttonPrev).outerWidth(true) + 1;
            $(this.buttonNext).width(buttonWidth);
            $(this.buttonPrev).width(buttonWidth);

            // calculate width to fill
            var width = $(this.navigation).parent().parent().outerWidth(true) - (2 * buttonWidth);

            width -= parseInt($(this.navigation).parent().css('marginLeft')) + parseInt($(this.navigation).parent().css('marginRight'));

            $(this.navigation).each(function (i, elem) {
                width -= $(elem).children('span').width();
            });

            var padding = parseInt(width / ($(this.navigation).length * 2));
            var diff = width - ($(this.navigation).length * padding * 2);

            $(this.navigation).each(function (i, elem) {
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


        new PlentyFunction('[data-plenty-checkout-href]', function (elem) {
            $(elem).each(function () {
                $(this).click(function () {
                    goToID($(this).attr('data-plenty-checkout-href'));
                });
            });
        });

    });

}(PlentyFramework));