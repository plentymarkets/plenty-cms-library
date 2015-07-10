(function(pm) {

	pm.service('CheckoutService', function(API, UI, CMS, Checkout, Modal) {

		return {
            init: init,
            setCustomerSignAndInfo: setCustomerSignAndInfo,
            setShippingProfile: setShippingProfile,
            saveShippingAddress: saveShippingAddress,
            preparePayment: preparePayment,
            setMethodOfPayment: setMethodOfPayment,
            editBankDetails: editBankDetails
		};

        function init() {
            UI.showWaitScreen();
            Checkout.getCheckout()
                .done(function() {
                    UI.hideWaitScreen();
                });
        }


        function setCustomerSignAndInfo() {
            var form = $('[data-plenty-checkout-form="details"]');
            var values = form.getFormValues();

            // initialize CustomerSign & InfoText to avoid updating empty values
            if (!Checkout.checkout().CheckoutCustomerSign) Checkout.checkout().CheckoutCustomerSign = "";
            if (!Checkout.checkout().CheckoutOrderInfoText) Checkout.checkout().CheckoutOrderInfoText = "";

            if (Checkout.checkout().CheckoutCustomerSign !== values.CustomerSign || Checkout.checkout().CheckoutOrderInfoText !== values.OrderInfoText) {
                Checkout.checkout().CheckoutCustomerSign = values.CustomerSign;
                Checkout.checkout().CheckoutOrderInfoText = values.OrderInfoText;

                UI.showWaitScreen();
                return Checkout.setCheckout()
                    .done(function () {
                        Checkout.reloadCatContent(checkoutConfirmCatId);
                        UI.hideWaitScreen();
                    });
            }
        }

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

                        Checkout.checkout().CheckoutCustomerShippingAddressID = response.data.ID;
                        delete Checkout.checkout().CheckoutMethodOfPaymentID;
                        delete Checkout.checkout().CheckoutShippingProfileID;

                        Checkout.setCheckout().done(function () {
                            Checkout.reloadContainer('MethodsOfPaymentList');
                            // TODO: the following container may not be reloaded if guest registration
                            if ( Checkout.checkout().CustomerInvoiceAddress.LoginType == 2 ) {
                                Checkout.reloadContainer('CustomerShippingAddress');
                            }
                            Checkout.reloadCatContent(checkoutConfirmCatId);
                            UI.hideWaitScreen();
                        });
                    });


            } else if ( !! values.shippingAddressID ) {
                // is not guest registration

                // change shipping address id
                Checkout.checkout().CheckoutCustomerShippingAddressID = values.shippingAddressID;
                delete Checkout.checkout().CheckoutMethodOfPaymentID;
                delete Checkout.checkout().CheckoutShippingProfileID;

                return Checkout.setCheckout()
                    .done(function () {
                        Checkout.reloadContainer('MethodsOfPaymentList');
                        Checkout.reloadContainer('CustomerShippingAddress');
                        Checkout.reloadCatContent(checkoutConfirmCatId);
                        UI.hideWaitScreen();
                    });
            }
        }

        function setShippingProfile() {

            var values = $('[data-plenty-checkout-form="shippingProfileSelect"]').getFormValues();

            Checkout.checkout().CheckoutShippingProfileID = values.ShippingProfileID;
            delete Checkout.checkout().CheckoutCustomerShippingAddressID;
            delete Checkout.checkout().CheckoutMethodOfPaymentID;

            UI.showWaitScreen();
            return Checkout.setCheckout()
                .done(function() {
                    Checkout.reloadContainer('MethodsOfPaymentList');
                    Checkout.reloadCatContent(checkoutConfirmCatId);
                    UI.hideWaitScreen();
                });

        }

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

        function setMethodOfPayment() {

            var values = $('[data-plenty-checkout-form="methodOfPayment"]').getFormValues();

            Checkout.checkout().CheckoutMethodOfPaymentID = values.MethodOfPaymentID;
            delete Checkout.checkout().CheckoutCustomerShippingAddressID;
            delete Checkout.checkout().CheckoutShippingProfileID;

            UI.showWaitScreen();
            return Checkout.setCheckout()
                .done(function() {
                    Checkout.reloadContainer('ShippingProfilesList');
                    Checkout.reloadCatContent(checkoutConfirmCatId);
                    UI.hideWaitScreen();
                });
        }

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
                                if( $(radio).val() == Checkout.checkout().CheckoutMethodOfPaymentID ) {
                                    $(radio).attr('checked', 'checked');
                                } else {
                                    $(radio).removeAttr('checked');
                                }
                            });
                        })
                        .show();
                });

        }

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
                    Checkout.getCheckout().done(function() {
                        processMethodOfPaymentChange(3);
                        Checkout.reloadContainer('MethodOfPaymentList');
                        UI.hideWaitScreen();
                    });
                });
        }

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
                    NewsletterCheck:            values.newsletterCheck || 0
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
}(PlentyFramework));