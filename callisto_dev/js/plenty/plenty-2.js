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