/**
 * @module Services
 */
(function($, pm) {

    /**
     * Providing methods for checkout process like setting shipping & payment information and placing the order.<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "UIFactory"}}UIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CMSFactory"}}CMSFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CheckoutFactory"}}CheckoutFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "ModalFactory"}}ModalFactory{{/crossLink}}</li>
     * </ul>
     * @class CheckoutService
     * @static
     */
	pm.service('CheckoutService', function(API, UI, CMS, Checkout, Modal) {

		return {
            init: init,
            setCustomerSignAndInfo: setCustomerSignAndInfo,
            setShippingProfile: setShippingProfile,
            saveShippingAddress: saveShippingAddress,
            preparePayment: preparePayment,
            setMethodOfPayment: setMethodOfPayment,
            editBankDetails: editBankDetails,
            placeOrder: placeOrder
		};

        /**
         * Load checkout data initially on page load
         * @function init
         */
        function init() {
            UI.showWaitScreen();
            Checkout.loadCheckout()
                .done(function() {
                    UI.hideWaitScreen();
                });
        }


        /**
         * Read customer sign and order information text from &lt;form> marked with <b>data-plenty-checkout-form="details"</b>
         * and update checkout.
         * @function setCustomerSignAndInfo
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function setCustomerSignAndInfo() {
            var form = $('[data-plenty-checkout-form="details"]');
            var values = form.getFormValues();

            // initialize CustomerSign & InfoText to avoid updating empty values
            if (!Checkout.getCheckout().CheckoutCustomerSign) Checkout.getCheckout().CheckoutCustomerSign = "";
            if (!Checkout.getCheckout().CheckoutOrderInfoText) Checkout.getCheckout().CheckoutOrderInfoText = "";

            if ( ( Checkout.getCheckout().CheckoutCustomerSign !== values.CustomerSign && $(form).find('[name="CustomerSign"]').length > 0 )
                || ( Checkout.getCheckout().CheckoutOrderInfoText !== values.OrderInfoText && $(form).find('[name="OrderInfoText"]').length > 0 ) ) {

                Checkout.getCheckout().CheckoutCustomerSign = values.CustomerSign;
                Checkout.getCheckout().CheckoutOrderInfoText = values.OrderInfoText;

                UI.showWaitScreen();
                return Checkout.setCheckout()
                    .done(function () {
                        Checkout.reloadCatContent( pm.getGlobal('checkoutConfirmCatID') );
                        UI.hideWaitScreen();
                    });

            }
        }

        /**
         * Read address data from &lt;form> marked with <b>data-plenty-checkout-form="shippingAddress"</b>.
         * Create new shipping address or update the shipping address ID.
         * @function saveShippingAddress
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function saveShippingAddress() {
            var form = $('[data-plenty-checkout-form="shippingAddress"]');
            var values = form.getFormValues();

            // TODO: move bootstrap specific function
            $('#shippingAdressSelect').modal('hide');

            UI.showWaitScreen();

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

                return API.post("/rest/checkout/customershippingaddress/", shippingAddress)
                    .done(function (response) {

                        Checkout.getCheckout().CheckoutCustomerShippingAddressID = response.data.ID;
                        delete Checkout.getCheckout().CheckoutMethodOfPaymentID;
                        delete Checkout.getCheckout().CheckoutShippingProfileID;

                        Checkout.setCheckout().done(function () {
                            Checkout.reloadContainer('MethodsOfPaymentList');
                            // TODO: the following container may not be reloaded if guest registration
                            if ( Checkout.checkout().CustomerInvoiceAddress.LoginType == 2 ) {
                                Checkout.reloadContainer('CustomerShippingAddress');
                            }
                            Checkout.reloadCatContent( pm.getGlobal('checkoutConfirmCatID') );
                            UI.hideWaitScreen();
                        });
                    });


            } else if ( !! values.shippingAddressID ) {
                // is not guest registration

                // change shipping address id
                Checkout.getCheckout().CheckoutCustomerShippingAddressID = values.shippingAddressID;
                delete Checkout.getCheckout().CheckoutMethodOfPaymentID;
                delete Checkout.getCheckout().CheckoutShippingProfileID;

                return Checkout.setCheckout()
                    .done(function () {
                        Checkout.reloadContainer('MethodsOfPaymentList');
                        Checkout.reloadContainer('CustomerShippingAddress');
                        Checkout.reloadCatContent( pm.getGlobal('checkoutConfirmCatID') );
                        UI.hideWaitScreen();
                    });
            }
        }

        /**
         * Set the shipping profile used for this order and update checkout. Selected shipping profile will be
         * read from &lt;form> marked with <b>data-plenty-checkout-form="shippingProfileSelect"</b>
         * @function setShippingProfile
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function setShippingProfile() {

            var values = $('[data-plenty-checkout-form="shippingProfileSelect"]').getFormValues();

            Checkout.getCheckout().CheckoutShippingProfileID = values.ShippingProfileID;
            delete Checkout.getCheckout().CheckoutCustomerShippingAddressID;
            delete Checkout.getCheckout().CheckoutMethodOfPaymentID;

            UI.showWaitScreen();
            return Checkout.setCheckout()
                .done(function() {
                    Checkout.reloadContainer('MethodsOfPaymentList');
                    Checkout.reloadCatContent( pm.getGlobal('checkoutConfirmCatID') );
                    UI.hideWaitScreen();
                });

        }

        /**
         * Prepare method of payment to check if external checkout is used or addition content should be displayed
         * @function preparePayment
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function preparePayment() {
            UI.showWaitScreen();

            return API.post("/rest/checkout/preparepayment/", null)
                .done(function(response) {
                    if( response.data.CheckoutMethodOfPaymentRedirectURL != '') {

                        document.location.href = response.data.CheckoutMethodOfPaymentRedirectURL;

                    } else if( !!response.data.CheckoutMethodOfPaymentAdditionalContent ) {

                        Modal.prepare()
                            .setTemplate( response.data.CheckoutMethodOfPaymentAdditionalContent )
                            .show();
                    }

                    UI.hideWaitScreen();
                });
        }

        /**
         * Set the method of payment used for this order.
         * @function setMethodOfPayment
         * @param {number|undefined} paymentID  ID of the method of payment to use. Read from &lt;form> marked with
         *                                      <b>data-plenty-checkout-form="methodOfPayment"</b> if unset.
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function setMethodOfPayment( paymentID ) {

            paymentID = paymentID || $('[data-plenty-checkout-form="methodOfPayment"]').getFormValues().MethodOfPaymentID;

            Checkout.getCheckout().CheckoutMethodOfPaymentID = paymentID;
            delete Checkout.getCheckout().CheckoutCustomerShippingAddressID;
            delete Checkout.getCheckout().CheckoutShippingProfileID;

            UI.showWaitScreen();
            return Checkout.setCheckout()
                .done(function() {
                    Checkout.reloadContainer('ShippingProfilesList');
                    Checkout.reloadCatContent( pm.getGlobal('checkoutConfirmCatID') );
                    UI.hideWaitScreen();
                });
        }

        /**
         * Display the popup to enter or edit customers bank details
         * @function editBankDetails
         */
        function editBankDetails() {

            UI.showWaitScreen();

            CMS.getContainer('CheckoutPaymentInformationBankDetails').from('Checkout')
                .done(function(response) {
                    UI.hideWaitScreen();
                    Modal.prepare()
                        .setTemplate(response.data[0])
                        .onConfirm(saveBankDetails)
                        .onDismiss(function() {
                            $('input[name="MethodOfPaymentID"]').each(function(i, radio) {
                                if( $(radio).val() == Checkout.getCheckout().CheckoutMethodOfPaymentID ) {
                                    $(radio).attr('checked', 'checked');
                                } else {
                                    $(radio).removeAttr('checked');
                                }
                            });
                        })
                        .show();
                });

        }

        /**
         * Read entered bank details from <b>data-plenty-checkout-form="bankDetails"</b> and update checkout.
         * @function saveBankDetails
         * @private
         */
        function saveBankDetails() {
            var values = $('[data-plenty-checkout-form="bankDetails"]').getFormValues();

            var bankDetails = {
                CustomerBankName:       values.customerBankDetails.bankName,
                CustomerBLZ:            values.customerBankDetails.blz,
                CustomerAccountNumber:  values.customerBankDetails.accountNo,
                CustomerAccountOwner:   values.customerBankDetails.accountOwner,
                CustomerIBAN:           values.customerBankDetails.iban,
                CustomerBIC:            values.customerBankDetails.bic
            };

            UI.showWaitScreen();
            API.post("/rest/checkout/customerbankdetails/", bankDetails)
                .done(function() {
                    Checkout.loadCheckout().done(function() {
                        setMethodOfPayment(3);
                        Checkout.reloadContainer('MethodOfPaymentList');
                        UI.hideWaitScreen();
                    });
                });
        }

        /**
         * Place the order prepared before and finish the checkout process.<br>
         * Validate required checkboxes in <b>data-plenty-checkout-form="placeOrder"</b>
         * @function placeOrder
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred Object</a>
         */
        function placeOrder() {
            var form = $('[data-plenty-checkout-form="placeOrder"]');
            if ( form.validateForm() ) {

                var values = form.getFormValues();

                // if not shown in layout set default 1 for mandatory fields
                var params = {
                    TermsAndConditionsCheck:    values.termsAndConditionsCheck || 0,
                    WithdrawalCheck:            values.withdrawalCheck || 0,
                    PrivacyPolicyCheck:         values.privacyPolicyCheck || 0,
                    AgeRestrictionCheck:        values.ageRestrictionCheck || 0,
                    NewsletterCheck:            values.newsletterCheck || 0,
                    KlarnaTermsAndConditionsCheck: values.klarnaTermsAndConditionsCheck || 0,
                    PayoneDirectDebitMandateCheck: values.payoneDirectDebitMandateCheck || 0,
                    PayoneInvoiceCheck:            values.payoneInvoiceCheck || 0
                };

                UI.showWaitScreen();

                return API.post("/rest/checkout/placeorder/", params)
                    .done(function(response) {
                        if(response.data.MethodOfPaymentRedirectURL != '') {

                            document.location.href = response.data.MethodOfPaymentRedirectURL;

                        } else if(response.data.MethodOfPaymentAdditionalContent != '') {

                            UI.hideWaitScreen();
                            Modal.prepare()
                                .setTemplate( response.data.MethodOfPaymentAdditionalContent)
                                .onDismiss(function() {
                                    document.location.href = form.attr('action');
                                })
                                .show();

                        } else {

                            document.location.href = form.attr('action');

                        }
                    });
            }
        }


	}, ['APIFactory', 'UIFactory', 'CMSFactory', 'CheckoutFactory', 'ModalFactory']);
}(jQuery, PlentyFramework));