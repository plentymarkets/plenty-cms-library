/* plenty scripts */

/*
 * Initialization
 */
(function($) {
	
	/*
	 *	GLOBAL FUNCTIONS
	 *	- scroll to top
	 *  - bootstrap tooltip
	 *  - slideToggle target content
	 *  - lazy loading images
	 *	- tree navigation toggle
	 */
	
	/**
	 *	WEBSHOP FUNCTIONS
	 *	- Linking SingleItem
	 *	- Attribute Selection Toggle (item lists)
	 *	- Item-Quantity-Buttons
	 */
	
	// toggle attribute selection on item lists
	// TODO: delete (?)
	new PlentyFunction('.attributeSelectionTrigger', function(elem) {
		$(elem).click(function() {
			$(this).css('display', 'none');
			$(this).parents('.visible-hover').find('.attributeSelectionContainer').css('display', 'block');
			$(this).parents('.onHover').addClass('hover');
		});
	});
	
	new PlentyFunction('.closeAttributeSelection', function(elem) {
		$(elem).click(function() {
			$(this).parents('.visible-hover').find('.attributeSelectionTrigger').text('Variante ändern').css('display', 'block');
			$(this).parents('.attributeSelectionContainer').css('display', 'none');
			$('.onHover.hover').removeClass('hover');
		});
	});
	
	
	
	$(document).ready(function() {
		
		// login
		$('.dropdown input').focusin(function() {
			if ( window.mediaSize != 'xs' && window.mediaSize != 'sm' ) $(this).closest('.dropdown').addClass('open');
		}).focusout(function() {
			if ( window.mediaSize != 'xs' && window.mediaSize != 'sm' ) $(this).closest('.dropdown').removeClass('open');
		});
		$('.dropdown button[type="submit"]').click(function() {
			if ( window.mediaSize != 'xs' && window.mediaSize != 'sm' ) $(this).closest('.dropdown').addClass('open');
		});
		// cancel login
		$('[data-plenty="cancelLogin"]').click(function() {
			$(this).closest('.dropdown').removeClass('open');
			if ( window.mediaSize != 'xs' && window.mediaSize != 'sm' ) {
				$(this).closest('[data-plenty="loginFormContainer"]').hide(10, function() {
					$(this).animate({ height: 0 }, 300, function() {
						$(this).removeAttr('style');
					});
				});
			}
		});
		
		// mobile navigation / aside panel
		$(window).on('orientationchange', function() {
			$('body.aside-visible').removeClass('aside-visible');
			$('body.navigation-visible').removeClass('navigation-visible');
			
		});
		
		// initialize touch functionality for mobile navigation / aside panel (requires jquery.touchSwipe.min.js)
		$('.touch body > .wrapper').swipe({ 
			swipeLeft: swipeLeft, 
			swipeRight: swipeRight, 
			allowPageScroll: 'auto', 
			excludedElements: 'form, input, button, select, .owl-item, .ui-slider-handle'
		});
		function swipeLeft(event, direction, distance, duration, fingerCount) {
			if ( window.mediaSize == 'xs' || window.mediaSize == 'sm' ) {
				if ( $('body').is('.navigation-visible') ) {
					$('body').removeClass('navigation-visible');
				}
				else if ( ! $('body').is('.aside-visible') ) {
					$('body').addClass('aside-visible')
				}
			}
		}
		function swipeRight(event, direction, distance, duration, fingerCount) {
			if ( window.mediaSize == 'xs' || window.mediaSize == 'sm' ) {
				if ( ! $('body').is('.navigation-visible') && ! $('body').is('.aside-visible') ) {
					$('body').addClass('navigation-visible');
				}
				else if ( $('body').is('.aside-visible') ) {
					$('body').removeClass('aside-visible');
				}
			}
		}
		
		// inizialize cross selling slider (requires owl.carousel.js)
		$('.crossSellingSlider').owlCarousel({
			items: 4,
			itemsDesktop: [1199, 3],
			itemsDesktopSmall: [991, 4],
			itemsTablet: [767, 2],
			navigation: true,
			navigationText: false,
			rewindNav: false,
			pagination: true,
			mouseDrag: true,
			afterMove: function(current) { $(current).find('img[data-plenty-lazyload]').trigger('appear'); }
		});
		
		// inizialize preview image slider (requires owl.carousel.js)
		$('.previewImageSlider').owlCarousel({
			items: 1,
			itemsDesktop : false,
			itemsDesktopSmall : false,
			itemsTablet: false,
			itemsMobile : false,
			navigation: true,
			navigationText: false,
			lazyLoad: true,
			rewindNav: false,
			pagination: true,
			afterInit: function() { $('.owl-controls').removeAttr('style'); },
			afterUpdate: function() { $('.owl-controls').removeAttr('style'); },
			afterLazyLoad: function(owl) { owl.find('img:visible').css('display','inline-block'); }
		});
		
		
		$(window).on('orientationchange', function() {
			$('li.open > [data-plenty="openCloseToggle"]').parent().removeClass('open');
		});
		
	});
})(jQuery);

/*
 * Display error modal for old browsers
 */
(function($) {
	$(window).load(function() {
		
		// display errors for old browsers
		if( $('body').is('ielte7') ) {
			$('[data-plenty="browserErrorModal"] .modal-title').append('Ihr Browser ist veraltet!');
			$('[data-plenty="browserErrorModal"] .modal-body').append('<p>Um die Funktionen dieser Seite nutzen zu können, benötigen Sie eine aktuelle Version Ihres Browsers.<br>'
				+'Bitte aktuallisieren Sie Ihren Browser, um Ihren Einkauf fortsetzen zu können.</p>');
			
			$('[data-plenty="browserErrorModal"]').modal({
				show: true,
				backdrop: 'static',
				keyboard: false
			});
		}
		
	});
})(jQuery);

/*
 * Button "Go to top"
 * Shows and hides button depending on page scroll
 */
 
(function($) {
	
	// to top button
	positionToTopButton = function() {
		if( $(document).scrollTop() > 100 ) {
			$('[data-plenty="toTop"]').addClass('visible');
		} else {
			$('[data-plenty="toTop"]').removeClass('visible');
		}
	}
	
	$(window).scroll(function() {
		positionToTopButton();
	});
	
	$(window).resize(function() {
		positionToTopButton();
	});
	
})(jQuery);

/* Tab Handling
 *
 * Show tab with jQuery-selector 'TAB_SELECTOR'
   <a data-plenty-opentab="TAB_SELECTOR">								
 * (!) Requires bootstrap.js
 *
 * Show remote tab with jQuery-selector 'TAB_1' in target container (below)
   <span data-plenty-openremotetab="TAB_1">		
 *
 */
(function($) {
	new PlentyFunction('a[data-plenty-opentab]', function(elem) {
		// open tab
		$(elem).each(function(i, obj) {
			$(obj).click(function() {
				var tabSelector = $(this).attr('data-plenty-opentab');
				tabSelector = ( tabSelector == 'href' ) ? $(this).attr('href') : tabSelector;
				$(tabSelector).tab('show');
			});
		});
	});
	
	new PlentyFunction('[data-plenty-openremotetab]', function(elem) {
		// open remote tab
		$(elem).each(function(i, obj) {
			$(obj).click(function () {
				var tabSelector = $(this).attr('data-plenty-openremotetab');
				$(tabSelector).trigger('tabchange');
			});
		});
	});
})(jQuery);

/*
 * Remote tabs
 * tab content can be placed anywhere in body
 *
 * Content of remote tab
   <div data-plenty-labelledby="TAB_1" data-plenty-remotetabs-id="REMOTE_TAB_GROUP">
		<!-- Content of TAB_1 -->
	</div>
 *
 * Remote tab navigation
 * [...]
   <div data-plenty="remoteTabs" data-plenty-remotetabs-id="REMOTE_TAB_GROUP">
 	 	<ul>
 			<li class="active">
				<a data-plenty-tab-id="TAB_1">
					<!-- Title of TAB_1 -->
				</a>
			</li>
			<li>
				<a data-plenty-tab-id="TAB_2">
					<!-- Titel of TAB_2 -->
				</a>
			</li>
		</ul>
   </div>
 * 
 */
(function($) {
	new PlentyFunction('[data-plenty="remoteTabs"]', function(elem) {
		$(elem).each(function(i, remoteTab) {

			var tabsId = $(remoteTab).attr('data-plenty-remotetabs-id');

            // find tabs grouped by remotetabs-id
			$('[data-plenty="remoteTabs"][data-plenty-remotetabs-id="'+tabsId+'"]').each(function(i, tabs) {

                // bind each remote-tab
				$(tabs).find('a').each(function(i, singleTab) {

					var singleTabId = $(singleTab).attr('data-plenty-tab-id');

                    // listen to 'tabchange' event
					$(singleTab).on('tabchange', function() {
                        // toggle class 'active'
						$(singleTab).closest('[data-plenty="remoteTabs"]').children('.active').removeClass('active');
						$(singleTab).closest('li').addClass('active');

                        // hide inactive tabs & show active tab
						var tabpanelsInactive = $('[data-plenty-remotetabs-id="'+tabsId+'"][data-plenty-tabpanel-labelledby]').not('[data-plenty-tabpanel-labelledby="'+singleTabId+'"]');
						var tabpanelActive = $('[data-plenty-remotetabs-id="'+tabsId+'"][data-plenty-tabpanel-labelledby="'+singleTabId+'"]');
						var zIndexTabpanelParents = 0;
						if ( $(tabs).attr('data-plenty-remotetabs-adapt') == 'tabpanel-parent' ) { 
							zIndexTabpanelParents = 2147483646;
							$('[data-plenty-remotetabs-id="'+tabsId+'"][data-plenty-tabpanel-labelledby]').parent().each(function() {
								var zIndexCurrent = parseInt( $(this).css('zIndex') );
								if ( typeof zIndexCurrent == 'number' && zIndexCurrent < zIndexTabpanelParents ) zIndexTabpanelParents = zIndexCurrent;
							});
						}

                        // adjust z-index if neccessary
						$(tabpanelsInactive).hide().removeClass('in');
						$(tabpanelActive).show().addClass('in');
						if ( zIndexTabpanelParents != 0 ) {
							$(tabpanelsInactive).parent().css('zIndex', zIndexTabpanelParents);
							$(tabpanelActive).parent().css('zIndex', zIndexTabpanelParents + 1);
						}
					});
				});
			});

            // trigger 'tabchange' event
            $(remoteTab).find('a').click(function() {
                $(this).trigger('tabchange');
            });
		});
		

	});
	
}(jQuery));

/*
 * Toggle Class
 * toggle style-classes on click
 * Usage / data-attribute:
 * <div data-plenty-toggle="{target: 'body', class: 'toggledClass', media: 'xs sm'}"></div>
 * target	:	jQuery selector to toggle the class at.
 * class		:  class(es) to toggle at target element
 * media		:  only toggle class on given media sizes (optional)
 *
 * (!) using data-plenty-toggle on <a>-elements will prevent redirecting to href=""
 */
(function($) {
	
	new PlentyFunction('[data-plenty-toggle]', function(elem) {
		$(elem).each(function() {
			if( $(this).attr('data-plenty-toggle').search(';') < 0 ) {
				eval('var data = ' + $(this).attr('data-plenty-toggle'));
				if ( data.target && data.class ) {
					$(this).click(function() {
						var isMedia = false;
						if ( data.media ) {
							if ( data.media.indexOf(' ') != -1 ) {
								var mediaArr = data.media.split(' ');
								for ( i = 0; i < mediaArr.length; i++ ) {
									if ( window.mediaSize == mediaArr[i] ) {
										isMedia = true;
									}
								}
							}
							else {
								if ( window.mediaSize == data.media ) isMedia = true;
							}
						}
						if ( ! data.media || isMedia == true  ) {
							$(data.target).toggleClass(data.class);
							if ( $(this).is('a') ) return false;
						}
					});
				}
			}
		});
	});
	
}(jQuery));

/*
 * Media Size Listener
 * triggers 'sizeChange' event if bootstrap breakpoints are passed while resizing
 * Usage:
 * $(window).on('sizeChange', function() {
 *		console.log(window.mediaSize);  
 * }); 
 */
(function($) {
	var mediaSize = '';
	$.extend(window, mediaSize);
	calculateMediaSize = function() {
		var size;
		if( !!window.matchMedia ) { // FIX IE support
			if( window.matchMedia('(min-width:1200px)').matches ) size = 'lg';
			else if( window.matchMedia('(min-width:992px)').matches ) size = 'md';
			else if( window.matchMedia('(min-width:768px)').matches ) size = 'sm';
			else size = 'xs';
		} else {
			if( $(window).width() >= 1200 ) size = 'lg';
			else if( $(window).width() >= 992 ) size = 'md';
			else if( $(window).width() >= 768 ) size = 'sm';
			else size = 'xs';
		}
		if( size != window.mediaSize ) {
			window.mediaSize = size;
			$(window).trigger('sizeChange');
		}
	};
	$(window).resize(function() {
		calculateMediaSize();	
	});
	$(document).ready(function() {
		calculateMediaSize();
	});
})(jQuery);
 
/*
 * jQuery plugin: auto-hide
 * automatically hide or remove elements
 * Usage:
 * $(selector).autoHide(options);
 */ 
(function($) {	
	$.fn.autoHide = function( options ) {
		var defaults = {
			hideAfter			: 4000,		// delay to hide or remove element, in milliseconds
			pauseOnHover 		: true,  	// pause delay when element is hovered
			removeFromDOM		: false, 	// remove the element from the DOM instead of hiding it
			overlaySelector	: false, 		// jQuery selector of an overlay, if used. Will be hidden after delay
			closeSelector		: false, 	// jQuery selector of a child-element to hide/ delete the element manually
			hideOnOverlayClick: true		// hide/ delete the element by clicking the overlay
		};
		var settings = $.extend( defaults, options );
			
		this.each(function(i, element) {
			/* hides/ removes the element. If overlay selector is set, hide it too */
			var doClose = function() {
				if ( !!settings.overlaySelector ) {
					$(settings.overlaySelector).hide();
				}
				// remove or hide after 'hideAfter' ms
				if ( settings.removeFromDOM ) $(element).remove();
				else $(element).hide();
			};
	
			/* start/ continue delay to close/ hide element */
			var startClosing = function( time ) {
				return setTimeout(function() {
					doClose();
				}, time);
			}
			
			if( settings.hideAfter > 0 ) {
				// START
				var timeStart = (new Date).getTime();
				var timeout = startClosing( settings.hideAfter );
	
				// PAUSE & CONTINUE
				if ( settings.pauseOnHover ) {
					var timeRemaining = 0;
					$(element).hover(function() {
						// store remaining time
						timeRemaining = (new Date).getTime() - timeStart;
						// stop closing on mouse in
						clearTimeout( timeout );
					}, function() {
						// continue closing in mouse out
						if ( timeRemaining > 0 ) {
							timeout = startClosing( timeRemaining );
						}
					});
				}
			}
			
			// STOP
			if ( !!settings.closeSelector ) $(element).find(settings.closeSelector).click( doClose );
			if ( settings.hideOnOverlayClick && !!settings.overlaySelector ) $(settings.overlaySelector).click( doClose );
		});
	};
})(jQuery);

/*
 * Form Validation
 * Validate required form inputs as given type of value
 * Usage / data-Attributes:
 * <form data-plenty-checkform="ERROR_CLASS">		This will activate the script for this form
 *													and add ERROR_CLASS to invalid elements
 *
 * <input data-plenty-validate="text">				Check if the value of this input is text (or number) and add ERROR_CLASS on failure
 * <div data-plenty-validate="text"><input></div>	You can put the data-plenty-validate="" on a parent element of an input.
 *													This will check the value of the input(s) inside and add ERROR_CLASS to the <div> on failure

 *	possible values for data-plenty-validate=""		text	: validate if value is text (or number or mixed)
 *													mail	: checks if value is a valid mail-address (not depending on inputs type-attribute)
 *													number: checks if value is a numeric value. For detailed information see: isNumberic()
 *													{min: 1, max: 3} validate that at least 'min' and maximum 'max' options are selected (checkboxes)
 *
 * possible form elements to validate				<input type="text | mail | password">
 * 													<textarea></textarea>					can validate "text", "mail", "number"
 *													<input type="radio" name="myRadio"> 	check if one radio-button in group "myRadio" is checked.
 *																							Ignores the value of data-plenty-validate
 *													<input type="checkbox" name="myCheck">	check if one checkbox in group "myCheck" is checked or use
 *																							data-plenty-valudate="{min: 3, max: 5}" to define custom range
 *													<select></select>						check if an option is selected and otions value is not "-1" (plenty default for: "choose"-option)
 *
 * Events:
 * 'validationFailed'								will be triggered if at least one element is not valid.
 *													Usage:
 *													form.on('validationFailed', function(event, invalidFields) {
 *	 													$(invalidFields).each({
 *															// manipulate invalid fields
 *														});
 *													});
 */
(function ($) {

    var FormValidator = {

        getFormControl: function( element ) {
            if( $(element).is('input') || $(element).is('select') || $(element).is('textarea') ) {
                return $(element);
            } else {
                if( $(element).find('input').length > 0 ) {
                    return $(element).find('input');
                }

                else if ( $(element).find('select').length > 0 ) {
                    return $(element).find('select');
                }

                else if ( $(element).find('textarea').length > 0 ) {
                    return $(element).find('textarea');
                }

                else {
                    return null;
                }
            }

        },

        validateText: function( formControl ) {
            // check if formControl is no checkbox or radio
            if ( $(formControl).is('input') || $(formControl).is('select') || $(formControl).is('textarea') ) {
                // check if length of trimmed value is greater then zero
                return $.trim( $(formControl).val() ).length > 0;

            } else {
                console.error('Validation Error: Cannot validate Text for <' + $(formControl).prop("tagName") + '>');
                return false;
            }
        },

        validateMail: function( formControl ) {
            var mailRegExp = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            if ( FormValidator.validateText(formControl) ) {
                return mailRegExp.test( $.trim( $(formControl).val() ) );
            } else {
                return false;
            }
        },

        validateNumber: function( formControl ) {
            if ( FormValidator.validateText(formControl) ) {
                return $.isNumeric( $.trim( $(formControl).val() ) );
            } else {
                return false;
            }
        },

        validateValue: function( formControl, reference ) {
            if( $(reference).length > 0 ) {
                return $.trim( $(formControl).val() ) == $.trim( $(reference).val() );
            } else {
                return $.trim( $(formControl).val() ) == reference;
            }
        },

        validate: function( form ) {
            var errorClass = !!$(form).attr('data-plenty-checkform') ? $(form).attr('data-plenty-checkform') : 'has-error';
            var missingFields = [];


            var hasError = false;

            // check every required input inside form
            form.find('[data-plenty-validate], input.Required').each(function(i, elem) {

                // validate text inputs
                var validationKeys = !!$(elem).attr('data-plenty-validate') ? $(elem).attr('data-plenty-validate') : 'text';
                validationKeys = validationKeys.split(',');

                var formControls = FormValidator.getFormControl(elem);
                for(i = 0; i < formControls.length; i++) {
                    var formControl = formControls[i];
                    var validationKey = validationKeys[i].trim() || validationKeys[0].trim();

                    if (!$(formControl).is(':visible') || !$(formControl).is(':enabled')) {
                        return;
                    }
                    var currentHasError = false;


                    // formControl is textfield (text, mail, password) or textarea
                    if (($(formControl).is('input') && $(formControl).attr('type') != 'radio' && $(formControl).attr('type') != 'checkbox') || $(formControl).is('textarea')) {

                        switch (validationKey) {

                            case 'text':
                                currentHasError = !FormValidator.validateText(formControl);
                                break;

                            case 'mail':
                                currentHasError = !FormValidator.validateMail(formControl);
                                break;

                            case 'number':
                                currentHasError = !FormValidator.validateNumber(formControl);
                                break;

                            case 'value':
                                currentHasError = !FormValidator.validateValue(formControl, $(elem).attr('data-plenty-validation-value'));
                                break;
                            case 'none':
                                // do not validate
                                break;
                            default:
                                console.error('Form validation error: unknown validate property: "' + $(elem).attr('data-plenty-validate') + '"');
                                break;
                        }
                    } else if ($(formControl).is('input') && ($(formControl).attr('type') == 'radio' || $(formControl).attr('type') == 'checkbox')) {
                        // validate radio buttons
                        var group = $(formControl).attr('name');
                        var checked, checkedMin, checkedMax;
                        checked = $(form).find('input[name="' + group + '"]:checked').length;

                        if ($(formControl).attr('type') == 'radio') {
                            checkedMin = 1;
                            checkedMax = 1;
                        } else {
                            eval("var minMax = " + $(elem).attr('data-plenty-validate'));
                            checkedMin = !!minMax ? minMax.min : 1;
                            checkedMax = !!minMax ? minMax.max : 1;
                        }

                        currentHasError = ( checked < checkedMin || checked > checkedMax );

                    } else if ($(formControl).is('select')) {
                        // validate selects
                        currentHasError = ( $(formControl).val() == '' || $(formControl).val() == '-1' );
                    } else {
                        console.error('Form validation error: ' + $(elem).prop("tagName") + ' does not contain an form element');
                        return;
                    }

                    if (currentHasError) {
                        hasError = true;
                        missingFields.push(formControl);

                        if(formControls.length > 1 ) {
                            $(formControl).addClass(errorClass);
                            $(form).find('label[for="'+$(formControl).attr('id')+'"]').addClass(errorClass);
                        } else {
                            $(elem).addClass(errorClass);
                        }
                    }
                }
            });

            if ( hasError ) {
                // remove error class on focus
                form.find('.has-error').each(function(i, elem) {
                    var formControl = FormValidator.getFormControl(elem);
                    $(formControl).on('focus click', function() {
                        $(formControl).removeClass( errorClass );
                        $(form).find('label[for="'+$(formControl).attr('id')+'"]').removeClass(errorClass);
                        $(elem).removeClass( errorClass );
                    });
                });

                form.trigger('validationFailed', [missingFields]);
            }

            var callback = form.attr('data-plenty-callback');
            if( !hasError && !!callback && callback != "submit" && typeof window[callback] == "function") {

                var fields = {};
                form.find('input, textarea, select').each(function (){
                    if( $(this).attr('type') == 'checkbox' ) {
                        fields[$(this).attr('name')] = $(this).is(':checked');
                    } else {
                        fields[$(this).attr('name')] = $(this).val();
                    }
                });

                window[callback](fields);
                return false;
            } else {
                return !hasError;
            }
        }
    };

    $.fn.validateForm = function() {
        return FormValidator.validate( this );
    };

    new PlentyFunction('form[data-plenty-checkform], form.PlentySubmitForm', function(elem) {

        $(elem).each(function() {

            $(this).submit(function() {
                return $(this).validateForm();
            });

        });

    });
	
	
	/**
	 * Get the values of inner form elements.
	 * @return { input.name => input.value }
	 */
	$.fn.getFormValues = function() {
		var values = {};
		this.find('input, select, textarea').each(function(i, elem) {
			if( $(elem).attr('type') == "checkbox" ) {
				values[$(elem).attr('name')] = $(elem).is(':checked') ? $(elem).val() : null;
			} else if( $(elem).attr('type') == 'radio' ) {
				if( $(elem).is(':checked') ) values[$(elem).attr('name')] = $(elem).val();
			} else {
				values[$(elem).attr('name')] = $(elem).val();
			}
		});
		return values;
	}
}(jQuery));

/*
 * Social Share Activation
 * Activate and load share-buttons manually by clicking a separate button
 * Usage / data-attributes:
 * <div data-plenty-social="twitter">
 * 	<span data-plenty="switch"></span>				Will be used to activate the service set in data-plenty-social=""
 *		<span data-plenty="placeholder"></span>		Will be replaced with loaded share button
 * </div>
 *
 * possible values for data-plenty-social:
 * "facebook-like"			: Load Facebooks "Like"-Button
 * "facebook-recommend"		: Load Facebooks "Recommend"-Button
 * "twitter"				: Load Twitter Button
 * "google-plus"			: Load google "+1"-Button
 *
 * Additional Tooltips
 * You can extend the parent element with a (bootstrap) tooltip by adding data-toggle="tooltip" and title="TOOLTIP CONTENT"
 * Tooltip will be destroyed after activating a social service
 * (!) Requires bootstrap.js
 */
(function ($) {
	
	if ( typeof(socialLangLocale) == 'undefined' ) socialLangLocale = 'en_US';
	if ( typeof(socialLang) == 'undefined' ) socialLang = 'en';
	
	var services = {			
		'facebook-like' 	:	 '<iframe src="//www.facebook.com/plugins/like.php'
										+'?locale='+socialLangLocale
										+'&amp;href=' + encodeURIComponent(getURI())
										+'&amp;width=130'
										+'&amp;layout=button_count'
										+'&amp;action=like'
										+'&amp;show_faces=false'
										+'&amp;share=false'
										+'&amp;height=21'
										+'&amp;colorscheme=light" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:130px; height:21px;" allowTransparency="true"></iframe>',
		
		'facebook-recommend'	:	'<iframe src="//www.facebook.com/plugins/like.php'
											+'?locale='+socialLangLocale
											+'&amp;href=' + encodeURIComponent(getURI())
											+'&amp;width=130'
											+'&amp;layout=button_count'
											+'&amp;action=recommend'
											+'&amp;show_faces=false'
											+'&amp;share=false'
											+'&amp;height=21'
											+'&amp;colorscheme=light" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:130px; height:21px;" allowTransparency="true"></iframe>',
		
		'twitter'				: '<iframe src="//platform.twitter.com/widgets/tweet_button.html'
										+'?url=' + encodeURIComponent(getURI())
										+'&amp;text=' + getTweetText()
										+'&amp;count=horizontal'
										+'&amp;dnt=true" allowtransparency="true" frameborder="0" scrolling="no"  style="width:130px; height:21px;"></iframe>',
		
		'google-plus'			: '<div ' 
										+'class="g-plusone" '
										+'data-size="medium" '
										+'data-href="' + getURI() + '"></div>'
										+'<script type="text/javascript">window.___gcfg = {lang: "'+socialLang+'"}; (function() { var po = document.createElement("script"); po.type = "text/javascript"; po.async = true; po.src = "https://apis.google.com/js/platform.js"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(po, s); })(); </script>',
	};
	
	function getURI() {
		var uri = document.location.href;
		var canonical = $("link[rel=canonical]").attr("href");
		
		if (canonical && canonical.length > 0) {
			if (canonical.indexOf("http") < 0) {
				canonical = document.location.protocol + "//" + document.location.host + canonical;
			}
			uri = canonical;
		}
		
		return uri;
	};
	 
	 // returns content of <meta name="" content=""> tags or '' if empty/non existant
	function getMeta(name) {
		var metaContent = $('meta[name="' + name + '"]').attr('content');
		return metaContent || '';
	}
	
	// create tweet text from content of <meta name="DC.title"> and <meta name="DC.creator">
	// fallback to content of <title> tag
	function getTweetText() {
		var title = getMeta('DC.title');
		var creator = getMeta('DC.creator');
		
		if (title.length > 0 && creator.length > 0) {
			title += ' - ' + creator;
		} else {
			title = $('title').text();
		}
		
		return encodeURIComponent(title);
	}
	
	
	new PlentyFunction('[data-plenty-social]', function(elem) {
		$(elem).each(function() {
			var container = $(this);
			var toggle = container.find('[data-plenty="switch"]');
			
			// append container to put / delete service.html
			container.append('<div class="social-container"></div>');
			
			// add "off" class to switch, if neither "off" or "on" is set
			if ( !toggle.hasClass('off') && !toggle.hasClass('on') ) {
				toggle.addClass('off');
			}
			
			// toggle switch
			toggle.on('click', function() {
				if ( toggle.hasClass('off') ) {
					if ( container.attr("data-toggle") == "tooltip" ) { container.tooltip('destroy') };
					toggle.removeClass('off').addClass('on');
					// hide dummy button
					container.find('[data-plenty="placeholder"]').hide();
					// load HTML defined in 'api'
					container.find('.social-container').append( services[container.attr('data-plenty-social')] );
				}
				// do not disable social medias after activation
				/*
				else 
				{
					toggle.removeClass('on').addClass('off');
					// show dummy button
					container.find('[data-plenty="placeholder"]').show();
					// remove api HTML
					container.find('.social-container').html('');
				}
				*/
			});
		});
	});
}(jQuery));

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
(function ($) {
	new PlentyFunction('[data-plenty="contentpageSlider"]', function(elem) {
		$(elem).owlCarousel({
			navigation: true, 
			navigationText: false,
			slideSpeed: 1000,
			paginationSpeed: 1000,
			singleItem: true,
			autoPlay: 6000,
			stopOnHover: true,
			afterMove: function(current) { $(current).find('img[data-plenty-lazyload]').trigger('appear'); }
		});
	});
}(jQuery));

/*
 * Equal Box heights
 */
 
(function ($) {
	
	new PlentyFunction('[data-plenty-equal]', function(elem) {
		$(elem).each(function(i, obj) {
			var mediaSizes = $(obj).data('plenty-equal').replace(/\s/g, '').split(',');
			
			var targets = ( $(obj).find('[data-plenty-equal-target]').length > 0 ) ? $(obj).find('[data-plenty-equal-target]') : $(obj).children();
			
			var maxHeight = 0;
			$(targets).each(function(j, child) {
				
				$(child).css('height', '');
				
				if( $(child).outerHeight(true) > maxHeight ) {
					maxHeight = $(child).outerHeight(true);
				}
			});
			
			if( !mediaSizes || $.inArray( window.mediaSize, mediaSizes ) >= 0 ) targets.height(maxHeight);
			
		});
	}, true);
	
	$(window).on('sizeChange', function() {
		$('body').bindPlentyFunctions( '[data-plenty-equal]' );	
	});

    new PlentyFunction('[data-plenty-onenter]', function(elem) {
        $(elem).each(function(i, obj) {
            var onEnter = $(obj).attr('data-plenty-onenter');
            var callback = typeof window[onEnter] === 'function' ? window[onEnter] : (new Function('return ' + onEnter));
            $(obj).on('keypress', function(e) {

                if(e.which === 13 && !!callback && typeof callback === "function") {
                    callback.call();
                }
            });
        });
    });
}(jQuery));