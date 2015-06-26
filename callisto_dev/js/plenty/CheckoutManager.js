(function($){

	/**
	 * Object to handle checkout functions
	 */
	CheckoutManager = {};

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
	 *		LOGIN & REGISTRATION			*
	 ****************************************/

	/**
	 * Lost password
	 *
	 * @return 	Promise
	 */
	CheckoutManager.resetPassword = function() {

		var form = $('[data-plenty-checkout="lostPasswordForm"]');

		if( form.validateForm() ) {

			var values = form.getFormValues();

			var params = {
				Email: values.Email
			};

			CheckoutManager.showWaitScreen();
			return $.ajax(
				"/rest/checkout/lostpassword/",
				{
					data:		JSON.stringify( params ),
					dataType:	'json',
					type:		'POST',
					success: function( response ) {
						if ( response.data.IsMailSend == true ) {
							CheckoutManager.hideWaitScreen();
							$('[data-plenty-checkout="lostPasswordTextContainer"]').hide();
							$('[data-plenty-checkout="lostPasswordSuccessMessage"]').show();
						}
					},
					error: CheckoutManager.handleError
				}
			);

		}
	};

	/**
	 * Handle customers login
	 *
	 * @return Promise
	 */
	CheckoutManager.customerLogin = function() {
		var form = $('[data-plenty-checkout-form="customerLogin"]');
		if( form.validateForm() ) {
			var values = form.getFormValues();

			var params = {
				Email: values.loginMail,
				Password: values.loginPassword
			};

			CheckoutManager.showWaitScreen();

			return $.ajax(
				"/rest/checkout/login/",
				{
					data: JSON.stringify(params),
					dataType: 'json',
					type: 'POST',
					success: function () {
						// successful login -> go to form's target referenced by action-attribute
						window.location.href = form.attr('action');
					},
					error: CheckoutManager.handleError
				}
			);
		}
	};

	// bind login functions to login forms
	new PlentyFunction('[data-plenty-checkout-form="customerLogin"]', function(elem) {
		$(elem).on('submit', function() {
			CheckoutManager.customerLogin();
			return false;
		});
	});

	/**
	 * Evaluate invoice address form,
	 * modify checkout data and update checkout on server
	 *
	 * @param	invoiceAddress 	object containing address-data sent to server via ReST-API
	 * @return 	Promise
	 */
	CheckoutManager.setInvoiceAddress = function( invoiceAddress ) {

		CheckoutManager.showWaitScreen();
		return $.ajax(
			"/rest/checkout/customerinvoiceaddress/",
			{
				data:		JSON.stringify( invoiceAddress ),
				dataType:	'json',
				type:		'POST',
                success:    function(response) {
                    CheckoutManager.checkout.CustomerInvoiceAddress = response.data;
                },
				error: CheckoutManager.handleError
			}
		);
	};

	/**
	 * Prepare address-data to register new customer
	 * on success, redirect to forms target referenced by action-attribute
	 *
	 * @return Promise
	 */
	CheckoutManager.registerCustomer = function() {
		var form = $('[data-plenty-checkout-form="customerRegistration"]');
		if( form.validateForm() ) {
			var values = form.getFormValues();

			// create new invoice address
			var invoiceAddress = {
				LoginType: 2,
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
				VATNumber: values.VATNumber,
				Email: values.Email,
				EmailRepeat: values.EmailRepeat,
				BirthDay: values.BirthDay,
				BirthMonth: values.BirthMonth,
				BirthYear: values.BirthYear,
				Password: values.Password,
				PasswordRepeat: values.PasswordRepeat,
				PhoneNumber: values.PhoneNumber,
				MobileNumber: values.MobileNumber,
				FaxNumber: values.FaxNumber,
				Postnummer: values.Postnummer
			};

			return CheckoutManager.setInvoiceAddress(invoiceAddress).done(function () {

				window.location.href = form.attr('action');
			});
		}
	};

	/**
	 * Prepare address-data to register a guest
	 *
	 * @return Promise
	 */

	CheckoutManager.registerGuest = function() {
		var form = $('[data-plenty-checkout-form="guestRegistration"]');
		var values = form.getFormValues();

		// create new invoice address
		var invoiceAddress = {
			LoginType: 1,
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
			VATNumber: values.VATNumber,
			Email: values.Email,
			EmailRepeat: values.EmailRepeat,
			BirthDay: values.BirthDay,
			BirthMonth: values.BirthMonth,
			BirthYear: values.BirthYear,
			PhoneNumber: values.PhoneNumber,
			MobileNumber: values.MobileNumber,
			FaxNumber: values.FaxNumber,
			Postnummer: values.Postnummer
		};

		return CheckoutManager.setInvoiceAddress(invoiceAddress);
	};

	// TODO: is this still in use?
	new PlentyFunction('[data-plenty-checkout-form="customerLogin"]', function(elem) {
		$(elem).on('submit', function() {
			CheckoutManager.registerGuest().done(function() {
				CheckoutManager.saveShippingAddress().done(function() {
					registrationDone = true;
					CheckoutManager.Navigator.goTo( targetContainer.index );
					document.location.reload(true);
				});
			});
		});
	});

	/**
	 * Updatee address-data to register a guest
	 *
	 * @return Promise
	 */

	CheckoutManager.updateGuestInvoiceAddress = function() {
		var form = $('[data-plenty-checkout-form="guestRegistration"]');
		var values = form.getFormValues();

		// create new invoice address
		var invoiceAddress = {
			LoginType: 1,
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
			VATNumber: values.VATNumber,
			Email: values.Email,
			EmailRepeat: values.EmailRepeat,
			BirthDay: values.BirthDay,
			BirthMonth: values.BirthMonth,
			BirthYear: values.BirthYear,
			PhoneNumber: values.PhoneNumber,
			MobileNumber: values.MobileNumber,
			FaxNumber: values.FaxNumber,
			Postnummer: values.Postnummer
		};
		
		var hasChanges = false;
		for ( var key in invoiceAddress ) {
			console.log(key+' - '+CheckoutManager.checkout.CustomerInvoiceAddress[key]+' - '+invoiceAddress[key]);
			if ( CheckoutManager.checkout.CustomerInvoiceAddress[key]+'' !== invoiceAddress[key]+'' && key !== 'EmailRepeat' ) {
				console.log('		--> difference found '+typeof CheckoutManager.checkout.CustomerInvoiceAddress[key]+' - '+typeof invoiceAddress[key]);
				hasChanges = true;
				break;
			}
		}
		
		if ( hasChanges ) {	
			CheckoutManager.showWaitScreen();
			return CheckoutManager.setInvoiceAddress(invoiceAddress).done(function () {
				CheckoutManager.reloadCatContent(checkoutConfirmCatId);
				CheckoutManager.hideWaitScreen();
			});
		}
		
	};

	/**
	 * Updatee shipping address-data for guest
	 *
	 * @return Promise
	 */

	CheckoutManager.updateGuestAddresses = function() {
		
		var form = $('[data-plenty-checkout-form="guestRegistration"]');
		var values = form.getFormValues();

		// create new invoice address
		var invoiceAddress = {
			LoginType: 1,
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
			VATNumber: values.VATNumber,
			Email: values.Email,
			EmailRepeat: values.EmailRepeat,
			BirthDay: values.BirthDay,
			BirthMonth: values.BirthMonth,
			BirthYear: values.BirthYear,
			PhoneNumber: values.PhoneNumber,
			MobileNumber: values.MobileNumber,
			FaxNumber: values.FaxNumber,
			Postnummer: values.Postnummer
		};
		
		var hasChangesInvoiceAddress = false;
        for (var key in invoiceAddress) {
            console.log(key + ' - ' + CheckoutManager.checkout.CustomerInvoiceAddress[key] + ' - ' + invoiceAddress[key]);
            if (CheckoutManager.checkout.CustomerInvoiceAddress[key] + '' !== invoiceAddress[key] + '' && key !== 'EmailRepeat') {
                console.log('		--> difference found ' + typeof CheckoutManager.checkout.CustomerInvoiceAddress[key] + ' - ' + typeof invoiceAddress[key]);
                hasChangesInvoiceAddress = true;
                break;
            }
        }
		
		form = $('[data-plenty-checkout-form="shippingAddress"]');
		values = form.getFormValues();

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
		
		var hasChangesShippingAddress = false;
        if( $('[name="shippingAddressID"]:checked').val() < 0 ) {
            for (var key in shippingAddress) {
                console.log(key + ' - ' + CheckoutManager.checkout.CustomerShippingAddress[key] + ' - ' + shippingAddress[key]);
                if (CheckoutManager.checkout.CustomerShippingAddress[key] + '' !== shippingAddress[key] + '' && key !== 'EmailRepeat') {
                    console.log('		--> difference found ' + typeof CheckoutManager.checkout.CustomerShippingAddress[key] + ' - ' + typeof shippingAddress[key]);
                    hasChangesShippingAddress = true;
                    break;
                }
            }
        }
		
		var promise;
		
		if ( hasChangesInvoiceAddress ) {
			promise = CheckoutManager.setInvoiceAddress(invoiceAddress);
		}
		
		if ( hasChangesShippingAddress ) {
			
			if ( ! promise ) {
				promise = CheckoutManager.saveShippingAddress(shippingAddress);
			}
			else {
				promise.done(function() {
					CheckoutManager.saveShippingAddress(shippingAddress);
				});
			}
		}
		
		if ( !! promise ) {
			return promise.done(function() {
				CheckoutManager.reloadCatContent(checkoutConfirmCatId);
				CheckoutManager.hideWaitScreen();
			});
		}
		
	};


	/****************************************
	 *		   	  ITEM FUNCTIONS			*
	 ****************************************/

	/**
	 * @param   addBasketList
	 * @param   isUpdate
	 * @return  Promise
	 */
	CheckoutManager.addBasketItem = function(addBasketList, isUpdate) {
		if( !!addBasketList )
		{
			CheckoutManager.showWaitScreen();

			return $.ajax(
				"/rest/checkout/basketitemslist/",
				{
					type:		'POST',
					data:		JSON.stringify( addBasketList ),
					dataType:	'json',
					success: function() {
						CheckoutManager.getCheckout().done(function() {
							CheckoutManager.refreshBasketPreview();
							$('[data-plenty-id="dynamicModal"]').prepareModal({
								contentURL: '/rest/itemview/container_itemviewitemtobasketconfirmationoverlay/?ArticleID=' + addBasketList[0].BasketItemItemID,
								timeout: 5000,
								afterRequest: function(){
									CheckoutManager.hideWaitScreen();
								}
							});
						});
					},
					error: function(jqXHR, status, thrownError) {
						var response = $.parseJSON(jqXHR.responseText);
						if( !isUpdate && response.error.error_stack[0].code != undefined && response.error.error_stack[0].code == 100 )
						{
							CheckoutManager.currentBasketItemRequest = addBasketList;
							$('[data-plenty-id="dynamicModal"]').prepareModal({
								contentURL: '/rest/checkout/container_checkoutorderparamslist/?itemID='+addBasketList[0].BasketItemItemID+'&quantity='+addBasketList[0].BasketItemQuantity,
								afterRequest: function(){
									CheckoutManager.hideWaitScreen();
								}

							});
						}
						else
						{
							CheckoutManager.handleError(jqXHR, status, thrownError);
						}

					}
				}
			);
		}
	};

	CheckoutManager.addOrderParamValue = function(position, paramId, paramValue) {
		if (position > 0 && CheckoutManager.currentBasketItemRequest[position] == undefined)
		{
			CheckoutManager.currentBasketItemRequest[position] = $.extend(true, {}, CheckoutManager.currentBasketItemRequest[0]);
			CheckoutManager.currentBasketItemRequest[position].BasketItemOrderParamsList = [];
		}

		if(CheckoutManager.currentBasketItemRequest[position] != undefined)
		{
			CheckoutManager.currentBasketItemRequest[position].BasketItemQuantity = 1;
			if(CheckoutManager.currentBasketItemRequest[position].BasketItemOrderParamsList == undefined)
			{
				CheckoutManager.currentBasketItemRequest[position].BasketItemOrderParamsList = [];
			}

			CheckoutManager.currentBasketItemRequest[position].BasketItemOrderParamsList.push({
				BasketItemOrderParamID : paramId,
				BasketItemOrderParamValue : paramValue
			});
		}
	};

	/**
	 * OrderForm to JSON wrapper
	 */
	new PlentyFunction('[data-plenty="addBasketItemButton"]', function(elem)
	{
		$(elem).each(function(i, button)
		{
			$(button).click( function(e)
			{
                // avoid directing to href
                e.preventDefault();

				//init
				var basketItemsList	= {};
				var parentForm		= button.parents('form');

				basketItemsList.BasketItemItemID	= parentForm.find('[name="ArticleID"]').val();
				basketItemsList.BasketItemPriceID	= parentForm.find('[name="SYS_P_ID"]').val();
				basketItemsList.BasketItemQuantity	= parentForm.find('[name="ArticleQuantity"]').val();
				basketItemsList.BasketItemBranchID	= parentForm.find('[name="source_category"]').val();

				//attributes
				var attributeInputsList = parentForm.find('[name^="ArticleAttribute"]');
				var attributesList = [];

				$.each(attributeInputsList, function (idx, elem) {
					var match = elem.name.match(/^ArticleAttribute\[\d+]\[\d+]\[(\d+)]$/);
					if(match && match[1]) // erst prüfen, ob es das Array überhaupt gibt.
					{
						attributesList.push({
							BasketItemAttributeID 		: match[1],
							BasketItemAttributeValueID	: $(attributeInput).val()
						});
					}
				});

				if(attributesList.length != 0)
				{
					basketItemsList.BasketItemAttributesList = attributesList;
				}

				//add basketItem and refresh previewLists
				CheckoutManager.addBasketItem([basketItemsList]);

			});
		});
	});

	new PlentyFunction('[data-plenty="saveBasketOrderParams"]', function(elem)
	{
		$(elem).each(function(i, button)
		{
			$(button).click( function()
			{
				if(CheckoutManager.currentBasketItemRequest != undefined)
				{
					var parentForm		= button.parents('form');

					//Groups
					parentForm.find('[name^="ParamGroup"]').each(function(){
						var match = this.name.match(/^ParamGroup\[(\d+)]\[(\d+)]$/);
						CheckoutManager.addOrderParamValue(match[1], $(this).val(), $(this).val());
					});

					//Values
					parentForm.find('[name^="ParamValue"]').each(function(){

						if( ($(this).attr('type') == 'checkbox' && $(this).is(':checked')) ||
							($(this).attr('type') == 'radio' && $(this).is(':checked')) ||
							($(this).attr('type') != 'radio' && $(this).attr('type') != 'checkbox') )
						{
							var match = this.name.match(/^ParamValue\[(\d+)]\[(\d+)]$/);
							CheckoutManager.addOrderParamValue(match[1], match[2], $(this).val());
						}
					});

					CheckoutManager.addBasketItem(CheckoutManager.currentBasketItemRequest, true);
				}
			});
		});
	});

	/****************************************
	 *			BASKET FUNCTIONS			*
	 ****************************************/

	/**
	 * Remove item from basket
	 *
	 * @return Promise
	 */
	CheckoutManager.removeBasketItem = function() {

		if( !!CheckoutManager.currentBasketItemID && CheckoutManager.currentBasketItemID > 0 ) {
			CheckoutManager.showWaitScreen();
			return $.ajax(
				"/rest/checkout/basketitemslist/?basketItemIdsList[0]="+CheckoutManager.currentBasketItemID,
				{
					type:		'DELETE',
					success: function() {
						CheckoutManager.getCheckout().done(function() {
							$('[data-basket-item-id="'+CheckoutManager.currentBasketItemID+'"]').remove();

							if( !CheckoutManager.checkout.BasketItemsList || CheckoutManager.checkout.BasketItemsList.length <= 0 ) {

								CheckoutManager.reloadCatContent(basketCatId);

							} else {
								CheckoutManager.reloadContainer('Totals');
								// reset currentBasketItemID
								delete CheckoutManager.currentBasketItemID;
								CheckoutManager.hideWaitScreen();
							}

							CheckoutManager.refreshBasketPreview();
						});
					},
					error: CheckoutManager.handleError
				}
			);
		}
	};

	/**
	 * Set basket item quantity
	 *
	 * - updates quantity on server and in client-side CheckoutManager object
	 * - doesn't include security query if setting quantity 0
	 *
	 * - requires HTML:		[data-basket-item-id="CONTAINS_BASKET_ITEM_ID"]		...wraps basket list item, attribute contains BasketItemID
	 *  					[data-plenty-checkout="basket-item-price-total"]	...html-container which contains BasketItemPriceTotal
	 *
	 * @param   BasketItemID
	 * @param   BasketItemQuantity
	 * @return  Promise
	 */
	CheckoutManager.setItemQuantity = function( BasketItemID, BasketItemQuantity ) {

		// delete item if quantity is 0
		if( BasketItemQuantity <= 0 ) {
			CheckoutManager.currentBasketItemID = BasketItemID;
			return CheckoutManager.confirmDeleteBasketItem( BasketItemID );
		}

		var params = CheckoutManager.checkout.BasketItemsList;

		for ( var i = 0; i < params.length; i++ ) {
			if ( params[i].BasketItemID == BasketItemID ) {
				params[i].BasketItemQuantity = parseInt(BasketItemQuantity);
			}
		}

		CheckoutManager.showWaitScreen();
		return $.ajax(
			"/rest/checkout/basketitemslist/",
			{
				data:		JSON.stringify( params ),
				dataType:	'json',
				type:		'POST',
				success: function() {
					CheckoutManager.setCheckout().done(function() {
						CheckoutManager.reloadContainer('Totals');

						var basketItemsPriceTotal = 0;
						var params2 = CheckoutManager.checkout.BasketItemsList;
						for ( var i = 0; i < params2.length; i++ ) {
							if ( params2[i].BasketItemID == BasketItemID ) {
								basketItemsPriceTotal = params2[i].BasketItemPriceTotal;
							}
						}
						$('[data-basket-item-id="'+BasketItemID+'"]').find('[data-plenty-checkout="basket-item-price-total"]').html(basketItemsPriceTotal);
						CheckoutManager.refreshBasketPreview();
						CheckoutManager.hideWaitScreen();
					});
				},
				error: CheckoutManager.handleError
			}
		);

	};


	/**
	 * Confirm delete basket item
	 *
	 * - creates modal to confirm deleting item from basket (using delete-button oder setting quantity 0)
	 * - quantity 0 may be resetted after cancelling to resetItemQuantityTo
	 *
	 * - requires HTML:		[data-basket-item-id="CONTAINS_BASKET_ITEM_ID"]		...wraps basket list item, attribute contains BasketItemID
	 *  					[data-plenty="quantityInput"]						...quantity input of basket list item
	 *
	 * @param   BasketItemID
	 * @return  Promise
	 */
	CheckoutManager.confirmDeleteBasketItem = function( BasketItemID ) {

		// set currentBasketItemID
		CheckoutManager.currentBasketItemID = BasketItemID;

		// get item name
		var itemName, originalItemQuantity;
		var params = CheckoutManager.checkout.BasketItemsList;
		for ( var i = 0; i < params.length; i++ ) {
			if ( params[i].BasketItemID == BasketItemID ) {
				originalItemQuantity = params[i].BasketItemQuantity;
				itemName = params[i].BasketItemNameMap[1];
			}
		}


		var confirmationModal = $('[data-plenty-checkout="confirm-delete-basket-item"]');

		// insert item name
		confirmationModal.find('[data-plenty-checkout="itemName"]').text( itemName );

		// show modal
		$(confirmationModal).modal('show');

		// reset item quantity on cancel
		$(confirmationModal).on('hidden.bs.modal', function () {
			$('[data-basket-item-id="'+BasketItemID+'"]').find('[data-plenty="quantityInput"]').val( originalItemQuantity );
		});

	};


	/**
	 * Reload BasketPreview-Template and update basket totals
	 */
	CheckoutManager.refreshBasketPreview = function() {

		CheckoutManager.showWaitScreen();
		CheckoutManager.reloadItemContainer('BasketPreviewList').done(function() {

			$('[data-plenty-basket-empty]').each(function(i, elem) {
				var toggleClass = $(elem).attr('data-plenty-basket-empty');
				if( CheckoutManager.checkout.BasketItemsList.length <= 0 )
				{
					$(elem).addClass( toggleClass );
				}
				else
				{
					$(elem).removeClass( toggleClass );
				}
			});
			CheckoutManager.hideWaitScreen();
		});

		//update quantity
		var itemQuantityTotal = 0;
		$.each( CheckoutManager.checkout.BasketItemsList, function(i, basketItem)
		{
			itemQuantityTotal += basketItem.BasketItemQuantity;
		});

		$('[data-plenty-basket-preview="itemQuantityTotal"]').text( itemQuantityTotal );
		$('[data-plenty-basket-preview="totalsItemSum"]').text( CheckoutManager.checkout.Totals.TotalsItemSum );
	};

	/**
	 * Handle ItemQuantityButtons:
	 * Trigger 'change' on depending QuantityInput after a delay.
	 */
	new PlentyFunction('[data-basket-item-id] [data-plenty="quantityInputButtonPlus"], [data-basket-item-id] [data-plenty="quantityInputButtonMinus"]', function(elem) {
		$(elem).each(function(i, button) {
			$(button).click(function() {

				if( !!$(button).data('timeout') ) {
					clearTimeout( $(button).data('timeout') );
				}

				var timeout = setTimeout(function() {
					$(button).parents('[data-plenty="quantityInputWrapper"]').find('[data-plenty="quantityInput"]').trigger('change');
				}, 1000);

				$(button).data('timeout', timeout);

			});
		});
	});

	/**
	 * Handle QuantityInput's change:
	 * Check if value really has changed and update if necessary
	 */
	new PlentyFunction('[data-basket-item-id] [data-plenty="quantityInput"]', function(elem) {
		$(elem).each(function(i, input) {
			$(input).change( function() {

				var newQuantity = parseInt( $(input).val() );
				// set parsed value to avoid invalid characters
				$(input).val( newQuantity );

				var basketItemID = $(input).parents('[data-basket-item-id]').attr('data-basket-item-id');


				// check if value has changed
				var valueChanged = true;
				$.each(CheckoutManager.checkout.BasketItemsList, function(i, BasketItem) {

					// break if quantity is not changed
					if( BasketItem.BasketItemID == basketItemID && BasketItem.BasketItemQuantity == newQuantity )
					{
						valueChanged = false;
						return false;
					}

				});

				if( valueChanged )
				{
					CheckoutManager.setItemQuantity(
						basketItemID,
						newQuantity
					);
				}
			});
		});
	});



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



	/****************************************
	 *				GUI HANDLING			*
	 ****************************************/
	CheckoutManager.Navigator = {
		navigation: [],		// contains navigation list elements
		container: [],		// content containers
		current: -1,		// index of currently shown content container
		buttonPrev: {},		// navigation buttons
		buttonNext: {}
	};

    CheckoutManager.Navigator.getCurrentContainer = function() {
        if( this.current >= 0 )
        {
            return {
                id: $(this.container[this.current]).attr('data-plenty-checkout-id'),
                index: this.current
            };
        }
        else
        {
            return null;
        }
    };

	/**
	 * Show checkout tab given by index
	 * @param index Index of target tab, starting at 0
	 */
	CheckoutManager.Navigator.goTo = function( index, ignoreInterceptors ) {
		var contentChanged = this.current != index;
        var continueTabChange = true;
		if( contentChanged && !ignoreInterceptors ) continueTabChange = $(this).triggerHandler("beforeChange", {index: index, id: $(this.container[index]).attr('data-plenty-checkout-id')});
		if( !continueTabChange ) return;

		var self = this;
		this.current = index;

		// hide content containers
		$(this.container).hide();

		// refresh navigation elements
		$(this.navigation).each(function(i, elem) {
			$(elem).removeClass('disabled active');
			$(elem).find('[role="tab"]').attr('aria-selected', 'false');

			if( i < self.current ) {
				// set current element as active
				$(elem).addClass('visited');
			} else if ( i == self.current ) {
				$(elem).addClass('active visited');
				$(elem).find('[role="tab"]').attr('aria-selected', 'true');
			} else if( i > self.current && !$(elem).is('.visited') ) {
				// disable elements behind active
				$(elem).addClass('disabled');
			}
		});
		this.fillNavigation();

		// hide "previous"-button if first content container is shown
		if( this.current <= 0 ) {
			$(this.buttonPrev).attr("disabled", "disabled");
		} else {
			$(this.buttonPrev).removeAttr("disabled");
		}

		// hide "next"-button if last content container is shown
		if( this.current+1 == this.navigation.length ) {
			$(this.buttonNext).attr("disabled", "disabled");
		} else {
			$(this.buttonNext).removeAttr("disabled");
		}

		// show current content container
		$(this.container[this.current]).show();

		// set location hash
		if( this.current > 0 ) window.location.hash = $(this.container[this.current]).attr('data-plenty-checkout-id');
		else if( window.location.hash.length > 0 ) window.location.hash = '';

		if( contentChanged ) $(this).triggerHandler("afterChange", {index: index, id: $(this.container[index]).attr('data-plenty-checkout-id')});
	};

    CheckoutManager.Navigator.continueChange = function(targetContainer) {
        CheckoutManager.Navigator.goTo( targetContainer.index, true );
    };

	/**
	 * Show next checkout tab if available
	 */
	CheckoutManager.Navigator.next = function() {
		if(this.current == 2)//todo, refactor
		{
			//prepare payment
			CheckoutManager.showWaitScreen();
			return $.ajax(
				"/rest/checkout/preparepayment/",
				{
					data:       null,
					dataType:	'json',
					type:		'POST',
					success:	function(response) {
						if(response.data.CheckoutMethodOfPaymentRedirectURL != '')
						{
							document.location.href = response.data.CheckoutMethodOfPaymentRedirectURL;
						}
						else
						{
							CheckoutManager.hideWaitScreen();
							if(CheckoutManager.Navigator.current < CheckoutManager.Navigator.navigation.length-1) CheckoutManager.Navigator.goTo(CheckoutManager.Navigator.current+1);
						}
					},
					error: CheckoutManager.handleError
				}
			);
		}
		else
		{
			if(this.current < this.navigation.length-1) this.goTo(this.current+1);
		}
	};

	/**
	 * Show previous checkout tab if available
	 */
	CheckoutManager.Navigator.previous = function() {
		if(this.current > 0) this.goTo(this.current-1);
	};

	/**
	 * Show checkout tab given by ID
	 * @param 	containerID 	ID of tab to show. Target tab must be marked with data-plenty-checkout-id="#..."
	 */
	CheckoutManager.Navigator.goToID = function( containerID ) {
		var self = this;
		if( containerID == 'next' ) {
			this.next();
			return true;
		} else if( containerID == 'prev' ) {
			this.previous();
			return true;
		} else {
			containerID = containerID.replace('#', '');
			$(this.container).each(function(i, elem) {
				if( $(elem).attr('data-plenty-checkout-id') == containerID ) {
					self.goTo(i);
					return true;
				}
			});
		}
		return false;
	};

	/**
	 * Calculate checkout navigations width to match its parent element
	 * by increasing its items padding
	 */
	CheckoutManager.Navigator.fillNavigation = function() {
		// break if manager has not been inizialized
		if( this.navigation.length <= 0 ) return;

		// set equal button width
		$(this.buttonNext).css('width','auto');
		$(this.buttonPrev).css('width','auto');
		var buttonWidth = ($(this.buttonPrev).outerWidth() < $(this.buttonNext).outerWidth()) ? $(this.buttonNext).outerWidth(true)+1 : $(this.buttonPrev).outerWidth(true)+1;
		$(this.buttonNext).width(buttonWidth);
		$(this.buttonPrev).width(buttonWidth);

		// calculate width to fill
		var width = $(this.navigation).parent().parent().outerWidth(true) - (2*buttonWidth);

		width -= parseInt($(this.navigation).parent().css('marginLeft')) + parseInt($(this.navigation).parent().css('marginRight'));

		$(this.navigation).each(function(i, elem) {
			width -= $(elem).children('span').width();
		});

		var padding = parseInt( width / ($(this.navigation).length * 2) );
		var diff = width - ($(this.navigation).length * padding * 2);

		$(this.navigation).each(function(i, elem) {
			var paddingLeft = padding;
			var paddingRight = padding;
			if( diff > 0 ) {
				paddingLeft++;
				diff--;
			}
			if( diff > 0 ) {
				paddingRight++;
				diff--;
			}
			$(elem).children('span').css('paddingLeft', paddingLeft+'px').css('paddingRight', paddingRight+'px');
		});
	};

	/**
	 * Initialize checkout navigation
	 */
	CheckoutManager.Navigator.init = function() {
		var self = this;
		// get elements from DOM
		this.navigation 	= 	$('[data-plenty-checkout="navigation"] > li');
		this.container 		= 	$('[data-plenty-checkout="container"] > div');
		this.buttonNext 	=	$('[data-plenty-checkout="next"]');
		this.buttonPrev 	=	$('[data-plenty-checkout="prev"]');

		if( this.navigation.length == this.container.length && this.container.length > 0 ) {

			this.container.hide();

			// initialize navigation
			this.navigation.each(function(i, elem) {
				$(elem).addClass('disabled');
				// handle navigation click events
				$(elem).click(function() {
					if( !$(this).is('.disabled') ) {
						self.goTo( i );
					}
				});
			});

			this.buttonNext.attr("disabled", "disabled");
			this.buttonNext.click(function() {
				self.next();
			});

			this.buttonPrev.attr("disabled", "disabled");
			this.buttonPrev.click(function() {
				self.previous();
			});

			window.addEventListener('hashchange', function() {
				if( window.location.hash.length > 0 ) {
					CheckoutManager.Navigator.goToID(window.location.hash);
				} else {
					CheckoutManager.Navigator.goTo(0);
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
			}
			var param = $.urlParam('gototab');
			// jump to hash from url param 'gototab'
			if ( window.location.hash.length == 0 && !! param && $('[data-plenty-checkout-id="'+param+'"]').length > 0 ) {
				window.location.hash = param;
			}
			// jump to hash
			else if( !this.goToID(window.location.hash) && this.current >= 0 ) {
				this.goTo(this.current);
			} else {
                this.goTo(0);
            }
			
		}
	};

	new PlentyFunction('[data-plenty-checkout-href]', function(elem) {
		$(elem).each(function() {
			$(this).click(function() {
				CheckoutManager.Navigator.goToID( $(this).attr('data-plenty-checkout-href') );
			});
		});
	});
}(jQuery));