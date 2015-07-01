/* plenty scripts */
(function($) {
    /*
     * Initialization
     */
	$(document).ready(function() {

		// login
		$('.dropdown input').focusin(function() {
			if ( plenty.MediaSize.interval() != 'xs' && plenty.MediaSize.interval() != 'sm' ) $(this).closest('.dropdown').addClass('open');
		}).focusout(function() {
			if ( plenty.MediaSize.interval() != 'xs' && plenty.MediaSize.interval() != 'sm' ) $(this).closest('.dropdown').removeClass('open');
		});
		$('.dropdown button[type="submit"]').click(function() {
			if ( plenty.MediaSize.interval() != 'xs' && plenty.MediaSize.interval() != 'sm' ) $(this).closest('.dropdown').addClass('open');
		});
		// cancel login
		$('[data-plenty="cancelLogin"]').click(function() {
			$(this).closest('.dropdown').removeClass('open');
			if ( plenty.MediaSize.interval() != 'xs' && plenty.MediaSize.interval() != 'sm' ) {
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
			if ( plenty.MediaSize.interval() == 'xs' || plenty.MediaSize.interval() == 'sm' ) {
				if ( $('body').is('.navigation-visible') ) {
					$('body').removeClass('navigation-visible');
				}
				else if ( ! $('body').is('.aside-visible') ) {
					$('body').addClass('aside-visible')
				}
			}
		}
		function swipeRight(event, direction, distance, duration, fingerCount) {
			if ( plenty.MediaSize.interval() == 'xs' || plenty.MediaSize.interval() == 'sm' ) {
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

    /*
     * Display error modal for old browsers
     */
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
 
    /*
     * jQuery plugin: auto-hide
     * automatically hide or remove elements
     * Usage:
     * $(selector).autoHide(options);
     */
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
			};
			
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
}(jQuery));