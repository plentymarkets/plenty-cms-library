(function($){

	/**
	 * Object to handle checkout functions
	 */
	CheckoutManager = {};

	/**
	 * Load additional libs asynchronous.
	 * @params libs - array of libs. File type not needed.
	 * */
	function loadLibsAsynchronous(libs) {
		// load asynchronous
		var additionals = [
			"checkout/NavigatorService",
			"checkout/AuthenticationService",
			"checkout/BasketService",
			"checkout/CustomerService"
		];
		var js = {};

		if (libs) {
			additionals.concat(libs);
		}

		for (var i = 0; i < additionals.length; i++)
		{
			js = document.createElement("script");

			js.type = "text/javascript";
			js.src = "/layout/callisto_2/js/plenty/" + additionals[i] + ".js";

			document.head.appendChild(js);
		}
	};
	loadLibsAsynchronous();

	/**
	 * Initialization:
	 * - get data from server
	 * - initialize GUI Elements and checkout navigation
	 */
	CheckoutManager.init = function( indexStart ) {
		this.Navigator.current = !!indexStart ? indexStart : -1;

		this.Navigator.init();
        CheckoutManager.showWaitScreen();
		this.getCheckout().done(function() {
            CheckoutManager.hideWaitScreen();
        });
	};

	/****************************************
	 *			GLOBAL FUNCTIONS			*
	 ****************************************/

	/**
	 * Wrap error messages in error popup, if popup doesn't already contain this error
	 * If popup is already visible, append new errors to popup's inner HTML
	 * otherwise create new popup
	 */
	CheckoutManager.handleError = function(jqXHR) {
		var responseText = $.parseJSON(jqXHR.responseText);
		onError(responseText.error.error_stack);
	};

	CheckoutManager.throwError = function(code, msg)
	{
		onError([{code: code, message: msg}]);
	};

	/**
	 * Manage error popup.
	 * Create popup or add messages, if popup exists.
	 *
	 * @param errorMessages - Array of error messages objects. example: [{code: 400, message: "something didn't work as it should!"}]
	 */
	function onError(errorMessages) {
		var popup = $('#CheckoutErrorPane');
		var errorHtml = '';

		// create error-popup if not exist
		if( popup.length <= 0 ) {
			popup = $('<div class="plentyErrorBox" id="CheckoutErrorPane" style="display: none;"><button class="close" type="button"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button><div class="plentyErrorBoxInner"></div></div>');

            $('body').append(popup);
			// bind popups 'close'-button
			popup.find('.close').click(function() {
				popup.hide();
			});
		}

		$.each(errorMessages, function(key, error) {
			// add additional error, if not exist.
			if( !popup.is(':visible') || popup.find('[data-plenty-error-code="'+error.code+'"]').length <= 0 ) {
				errorHtml += '\
					<div class="plentyErrorBoxContent" data-plenty-error-code="'+error.code+'">\
						<span class="PlentyErrorCode">Code '+error.code+':</span>\
						<span class="PlentyErrorMsg">'+error.message+'</span>\
					</div>';
			}
		});

		if( popup.is(':visible') ) {
			// append new error to existing errors, if popup is already visible
			popup.find('.plentyErrorBoxInner').append(errorHtml);
		} else {
			// replace generated error-HTML and show popup
			popup.find('.plentyErrorBoxInner').html(errorHtml);
			popup.show();
		}

		CheckoutManager.hideWaitScreen(true);
	}

	/**
	 * Wait-Screen
	 * Show or hide wait screen
	 */
	CheckoutManager.waitScreenCount = 0;
	CheckoutManager.showWaitScreen = function() {
		var waitScreen = $('#PlentyWaitScreen');
		// create wait-overlay if not exist
		if( waitScreen.length <= 0 ) {
			waitScreen = $('<div id="PlentyWaitScreen" class="overlay overlay-wait"></div>');
			$('body').append(waitScreen);
		}

		// show wait screen if not already visible
		if( !waitScreen.is('.in') ) {
			waitScreen.addClass('in');
		}

		// increase instance counter to avoid showing multiple overlays
		CheckoutManager.waitScreenCount++;
	};

	CheckoutManager.hideWaitScreen = function( forceClose ) {

		// decrease overlay count
		CheckoutManager.waitScreenCount--;

		// hide if all instances of overlays has been closed
		// or if closing is forced by user
		if( CheckoutManager.waitScreenCount <= 0 || !!forceClose ) {
			CheckoutManager.waitScreenCount = 0;
			$('#PlentyWaitScreen').removeClass('in');
		}
	};

	/**
	 * Receive global checkout data from ReST-API
	 *
	 * @return Promise interface
	 */
	CheckoutManager.getCheckout = function() {
		return $.ajax(
			"/rest/checkout/",
			{
				dataType:	'json',
				type:		'GET',
				success: function(response) {
					if( !!response ) CheckoutManager.checkout = response.data;
					else CheckoutManager.throwError(0, 'Could not receive checkout data [GET "/rest/checkout/" receives null value]');
				}
			}
		);
	};

	/**
	 * Update checkout data on server
	 *
	 * @return Promise interface
	 */
	CheckoutManager.setCheckout = function() {
		return $.ajax(
			"/rest/checkout/",
			{
				data:		JSON.stringify(CheckoutManager.checkout),
				dataType:	'json',
				type:		'PUT',
				success: function(response) {
					if( !!response ) CheckoutManager.checkout = response.data;
					else CheckoutManager.throwError(0, 'Could not receive checkout data [GET "/rest/checkout/" receives null value]');
				}
			}
		);
	};

	/**
	 * Get layout container from server and replace received HTML
	 * in containers marked width data-plenty-checkout-template="..."
	 *
	 * @param	container	Name of the template to load from server
	 */
	CheckoutManager.reloadContainer = function( container ) {
		CheckoutManager.showWaitScreen();
		return $.ajax(
			"/rest/checkout/container_checkout"+container.toLowerCase()+"/",
			{
				dataType:	'json',
				type:		'GET',
				success: function(response) {
					$('[data-plenty-checkout-template="'+container+'"]').each(function(i, elem) {
						$(elem).html(response.data[0]);
						$(elem).bindPlentyFunctions();
						CheckoutManager.hideWaitScreen();
					});
				}
			}
		);

	};

	/**
	 * Get category content from server and replace received HTML
	 * in containers marked width data-plenty-checkout-catcontent="..."
	 *
	 * @param	catId	ID of the category to load content (description 1) from server
	 * @return  Promise
	 */
	CheckoutManager.reloadCatContent = function( catId ) {
		CheckoutManager.showWaitScreen();
		return jQuery.ajax(
			"/rest/categoryview/categorycontentbody/?categoryID="+catId,
			{
				dataType:	'json',
				type:		'GET',
				success: function(response) {
					$('[data-plenty-checkout-catcontent="'+catId+'"]').each(function(i, elem) {
						$(elem).html(response.data[0]);
						$(elem).bindPlentyFunctions();
						CheckoutManager.hideWaitScreen(true);
					});
				}
			}
		);

	};

	/**
	 * Get layout container from server and replace received HTML
	 * in containers marked width data-plenty-itemview-template="..."
	 *
	 * @param	container	Name of the (item view) template to load from server
	 * @return  Promise
	 */
	CheckoutManager.reloadItemContainer = function( container ) {
		CheckoutManager.showWaitScreen();
		return $.ajax(
			"/rest/itemview/container_itemview"+container.toLowerCase()+"/",
			{
				dataType:	'json',
				type:		'GET',
				success: function(response) {
					$('[data-plenty-itemview-template="'+container+'"]').each(function(i, elem) {
						$(elem).html(response.data[0]);
						$(elem).bindPlentyFunctions();
						CheckoutManager.hideWaitScreen();
					});
				}
			}
		);

	};


	/****************************************
	 *			CHECKOUT FUNCTIONS			*
	 ****************************************/

	/**
	 * Set customer sign & order info text
	 */
	CheckoutManager.setCustomerSignAndInfo = function() {
		var form = $('[data-plenty-checkout-form="details"]');
		var values = form.getFormValues();

		// initialize CustomerSign & InfoText to avoid updating empty values
		if( !CheckoutManager.checkout.CheckoutCustomerSign ) CheckoutManager.checkout.CheckoutCustomerSign = "";
		if( !CheckoutManager.checkout.CheckoutOrderInfoText ) CheckoutManager.checkout.CheckoutOrderInfoText = "";

        if (CheckoutManager.checkout.CheckoutCustomerSign !== values.CustomerSign || CheckoutManager.checkout.CheckoutOrderInfoText !== values.OrderInfoText) {
            CheckoutManager.checkout.CheckoutCustomerSign = values.CustomerSign;
            CheckoutManager.checkout.CheckoutOrderInfoText = values.OrderInfoText;

            CheckoutManager.showWaitScreen();
            return CheckoutManager.setCheckout().done(function () {
                CheckoutManager.reloadCatContent(checkoutConfirmCatId);
                CheckoutManager.hideWaitScreen();
            });
        }


        /*
        var customerSign = values.CustomerSign;
		var orderInfoText = values.OrderInfoText;
		var changesFound = false;


		if (CheckoutManager.checkout.CheckoutCustomerSign !== customerSign) {
			changesFound = true;
			CheckoutManager.checkout.CheckoutCustomerSign = customerSign;
		}
		if (CheckoutManager.checkout.CheckoutOrderInfoText !== orderInfoText) {
			changesFound = true;
			CheckoutManager.checkout.CheckoutOrderInfoText = orderInfoText;
		}

		if (changesFound == true) {
			CheckoutManager.showWaitScreen();
			return CheckoutManager.setCheckout().done(function () {
				CheckoutManager.reloadCatContent(checkoutConfirmCatId);
				CheckoutManager.hideWaitScreen();
			});
		}
		*/
	};
	/**
	 * Evaluate shipping address form,
	 * modify checkout data and update checkout on server
	 *
	 * @return Promise
	 */
	CheckoutManager.saveShippingAddress = function() {
		var form = $('[data-plenty-checkout-form="shippingAddress"]');
		var values = form.getFormValues();

		$('#shippingAdressSelect').modal('hide');
		CheckoutManager.showWaitScreen();

		if ($('[name="shippingAddressID"]:checked').val() < 0) {
			// create new shipping address
			var shippingAddress = {
				FormOfAddressID: values.FormOfAddressID,
				Company: values.Company,
				FirstName: values.FirstName,
				LastName: values.LastName,
				Street: values.Street,
				HouseNo: values.HouseNo,
				AddressAdditional: values.AddressAdditional,
				ZIP: values.ZIP,
				City: values.City,
				CountryID: values.CountryID,
				Email: values.Email,
				Postnummer: values.Postnummer,
				PhoneNumber: values.PhoneNumber,
				FaxNumber: values.FaxNumber,
				VATNumber: values.VATNumber
			};

			return $.ajax(
				"/rest/checkout/customershippingaddress/",
				{
					data: JSON.stringify(shippingAddress),
					dataType: 'json',
					type: 'POST',
					success: function (response) {

						CheckoutManager.checkout.CheckoutCustomerShippingAddressID = response.data.ID;
						delete CheckoutManager.checkout.CheckoutMethodOfPaymentID;
						delete CheckoutManager.checkout.CheckoutShippingProfileID;

						CheckoutManager.setCheckout().done(function () {
							CheckoutManager.reloadContainer('MethodsOfPaymentList');
							// TODO: the following container may not be reloaded if guest registration
							if ( CheckoutManager.checkout.CustomerInvoiceAddress.LoginType == 2 ) {
								CheckoutManager.reloadContainer('CustomerShippingAddress');
							}
							CheckoutManager.reloadCatContent(checkoutConfirmCatId);
							CheckoutManager.hideWaitScreen();
						});
					},
					error: CheckoutManager.handleError
				}
			);

		} else if ( !! values.shippingAddressID ) {
			// is not guest registration

			// change shipping address id
			CheckoutManager.checkout.CheckoutCustomerShippingAddressID = values.shippingAddressID;
			delete CheckoutManager.checkout.CheckoutMethodOfPaymentID;
			delete CheckoutManager.checkout.CheckoutShippingProfileID;

			return CheckoutManager.setCheckout().done(function () {
				CheckoutManager.reloadContainer('MethodsOfPaymentList');
				CheckoutManager.reloadContainer('CustomerShippingAddress');
				CheckoutManager.reloadCatContent(checkoutConfirmCatId);
				CheckoutManager.hideWaitScreen();
			});
		}
	};

	/**
	 * Set shipping profile
	 *
	 * @return Promise interface
	 */
	CheckoutManager.setShippingProfile = function() {

		var values = $('[data-plenty-checkout-form="shippingProfileSelect"]').getFormValues();

		CheckoutManager.checkout.CheckoutShippingProfileID = values.ShippingProfileID;
		delete CheckoutManager.checkout.CheckoutCustomerShippingAddressID;
		delete CheckoutManager.checkout.CheckoutMethodOfPaymentID;

		CheckoutManager.showWaitScreen();
		return CheckoutManager.setCheckout().done(function() {
            CheckoutManager.reloadContainer('MethodsOfPaymentList');
			CheckoutManager.reloadCatContent(checkoutConfirmCatId);
			CheckoutManager.hideWaitScreen();
		});

	};

	/**
	 * Set method of payment
	 *
	 * @return Promise interface
	 */
	CheckoutManager.setMethodOfPayment = function() {

		var values = $('[data-plenty-checkout-form="methodOfPayment"]').getFormValues();

		if( values.MethodOfPaymentID == 3 && ! CheckoutManager.checkout.CustomerBankDetails.CustomerBankName) //lastschrift
		{
			CheckoutManager.editBankDetails();
		}
		else
		{
			CheckoutManager.processMethodOfPaymentChange(values.MethodOfPaymentID);
		}
	};

    CheckoutManager.editBankDetails = function() {

        CheckoutManager.showWaitScreen();
        $('[data-plenty-id="dynamicModal"]').prepareModal({
            contentURL: '/rest/checkout/container_checkoutcustomerbankdetails/',
            afterRequest: function() {
                CheckoutManager.hideWaitScreen();
            },
            onDismiss: function() {
                $('input[name="MethodOfPaymentID"]').each(function(i, radio) {
                    if( $(radio).val() == CheckoutManager.checkout.CheckoutMethodOfPaymentID )
                    {
                        $(radio).attr('checked', 'checked');
                    }
                    else
                    {
                        $(radio).removeAttr('checked');
                    }
                });
            }
        });

    };

	CheckoutManager.processMethodOfPaymentChange = function(methodOfPaymentID)
	{
		CheckoutManager.checkout.CheckoutMethodOfPaymentID = methodOfPaymentID;
		delete CheckoutManager.checkout.CheckoutCustomerShippingAddressID;
		delete CheckoutManager.checkout.CheckoutShippingProfileID;

		CheckoutManager.showWaitScreen();
		return CheckoutManager.setCheckout().done(function() {
			$('[data-plenty-id="dynamicModal"]').modal('hide');
			CheckoutManager.reloadContainer('ShippingProfilesList');
			CheckoutManager.reloadCatContent(checkoutConfirmCatId);
			CheckoutManager.hideWaitScreen();
		});
	};

	new PlentyFunction('[data-plenty="saveBankDetails"]', function(elem)
	{
		$(elem).each(function(i, button)
		{
			$(button).click( function()
			{
				var parentForm		= button.parents('form');

				var bankDetails = {};

				parentForm.find('[name="checkout[customerBankDetails][bankName]"]').each(function(){
					bankDetails.CustomerBankName = $(this).val();
				});

				parentForm.find('[name="checkout[customerBankDetails][blz]"]').each(function(){
					bankDetails.CustomerBLZ = $(this).val();
				});

				parentForm.find('[name="checkout[customerBankDetails][accountNo]"]').each(function(){
					bankDetails.CustomerAccountNumber = $(this).val();
				});

				parentForm.find('[name="checkout[customerBankDetails][accountOwner]"]').each(function(){
					bankDetails.CustomerAccountOwner = $(this).val();
				});

				parentForm.find('[name="checkout[customerBankDetails][iban]"]').each(function(){
					bankDetails.CustomerIBAN = $(this).val();
				});

				parentForm.find('[name="checkout[customerBankDetails][bic]"]').each(function(){
					bankDetails.CustomerBIC = $(this).val();
				});


				CheckoutManager.showWaitScreen();

				return $.ajax(
					"/rest/checkout/customerbankdetails/",
					{
						type:		'POST',
						data:		JSON.stringify( bankDetails ),
						dataType:	'json',
						success: function() {
							CheckoutManager.getCheckout().done(function() {
								CheckoutManager.processMethodOfPaymentChange(3);
							});
						},
						error: function(jqXHR, status, thrownError) {
							CheckoutManager.handleError(jqXHR, status, thrownError);
						}
					}
				);
			});
		});
	});


	/**
	 * Add coupon given by coupon code
	 *
	 * @return Promise interface
	 */
	CheckoutManager.addCoupon = function() {

		var params = {
			CouponActiveCouponCode: $('[data-plenty-checkout-form="couponCode"]').val()
		};

		CheckoutManager.showWaitScreen();
		return $.ajax(
			"/rest/checkout/coupon/",
			{
				data:		JSON.stringify( params ),
				dataType:	'json',
				type:		'POST',
				success: function() {
					//delete CheckoutManager.checkout.coupon;

					CheckoutManager.setCheckout().done(function() {
						CheckoutManager.reloadContainer('Coupon');
						CheckoutManager.reloadCatContent(checkoutConfirmCatId);
						CheckoutManager.hideWaitScreen();
					});
				},
				error: CheckoutManager.handleError
			}
		);

	};

	/**
	 * remove currently activated coupon
	 *
	 * @return Promise interface
	 */
	CheckoutManager.removeCoupon = function() {

		var params = {
			CouponActiveCouponCode: CheckoutManager.checkout.Coupon.CouponActiveCouponCode
		};

		CheckoutManager.showWaitScreen();
		$.ajax(
			"/rest/checkout/coupon/",
			{
				data:		JSON.stringify( params ),
				dataType:	'json',
				type:		'DELETE',
				success: function() {

					delete CheckoutManager.checkout.Coupon;

					CheckoutManager.setCheckout().done(function() {
						CheckoutManager.reloadContainer('Coupon');
						CheckoutManager.reloadCatContent(checkoutConfirmCatId);
						CheckoutManager.hideWaitScreen();
					});
				},
				error: CheckoutManager.handleError
			}
		);
	};




	/****************************************
	 *				PLACING ORDER			*
	 ****************************************/

	/**
	 * finish checkout process by placing order on server
	 *
	 * @return Promise interface
	 */
	CheckoutManager.placeOrder = function() {

		var form = $('[data-plenty-checkout-form="placeOrder"]');
		if ( form.validateForm() ) {

			var values = form.getFormValues();

			// if not shown in layout set default 1 for mandatory fields
			var params = {
				TermsAndConditionsCheck:    values.termsAndConditionsCheck || 0,
				WithdrawalCheck:            values.withdrawalCheck || 0,
				PrivacyPolicyCheck:         values.privacyPolicyCheck || 0,
				AgeRestrictionCheck:         values.ageRestrictionCheck || 0,
				NewsletterCheck:            values.newsletterCheck || 0
			};

			CheckoutManager.showWaitScreen();
			return $.ajax(
				"/rest/checkout/placeorder/",
				{
					data:       JSON.stringify( params ),
					dataType:	'json',
					type:		'POST',
					success:	function(response) {
						//document.location.href='/?OrderShow=checkout@OrderConfirmation';
						if(response.data.MethodOfPaymentRedirectURL != '')
						{
							document.location.href = response.data.MethodOfPaymentRedirectURL;
						}
						else if(response.data.MethodOfPaymentAdditionalContent != '')
						{
							$('[data-plenty-id="dynamicModal"]').prepareModal({
								externalContent: response.data.MethodOfPaymentAdditionalContent,
								externalTitle: 'Zahlung durchführen',
								onDismiss: function(){
									document.location.href = form.attr('action');
								}
							});
							CheckoutManager.hideWaitScreen();
						}
						else
						{
							document.location.href = form.attr('action');
						}
					},
					error: CheckoutManager.handleError
				}
			);
		}
		else {
			var distanceTop = 50;
			var missingCheckboxOffsetTop = $('[data-plenty-checkform]:visible').offset().top;
			if ( missingCheckboxOffsetTop - distanceTop < $(document).scrollTop() ) {
				$('html, body').animate({ scrollTop: ( missingCheckboxOffsetTop - distanceTop ) });
			}
		}
	};




}(jQuery));