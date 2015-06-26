(function ($) {
    /****************************************
     *        LOGIN & REGISTRATION            *
     ****************************************/

    /**
     * Lost password
     *
     * @return    Promise
     */
    CheckoutManager.resetPassword = function () {

        var form = $('[data-plenty-checkout="lostPasswordForm"]');

        if (form.validateForm()) {

            var values = form.getFormValues();

            var params = {
                Email: values.Email
            };

            CheckoutManager.showWaitScreen();
            return $.ajax(
                "/rest/checkout/lostpassword/",
                {
                    data: JSON.stringify(params),
                    dataType: 'json',
                    type: 'POST',
                    success: function (response) {
                        if (response.data.IsMailSend == true) {
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
    CheckoutManager.customerLogin = function () {
        var form = $('[data-plenty-checkout-form="customerLogin"]');
        if (form.validateForm()) {
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
    new PlentyFunction('[data-plenty-checkout-form="customerLogin"]', function (elem) {
        $(elem).on('submit', function () {
            CheckoutManager.customerLogin();
            return false;
        });
    });

    /**
     * Evaluate invoice address form,
     * modify checkout data and update checkout on server
     *
     * @param    invoiceAddress    object containing address-data sent to server via ReST-API
     * @return    Promise
     */
    CheckoutManager.setInvoiceAddress = function (invoiceAddress) {

        CheckoutManager.showWaitScreen();
        return $.ajax(
            "/rest/checkout/customerinvoiceaddress/",
            {
                data: JSON.stringify(invoiceAddress),
                dataType: 'json',
                type: 'POST',
                success: function (response) {
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
    CheckoutManager.registerCustomer = function () {
        var form = $('[data-plenty-checkout-form="customerRegistration"]');
        if (form.validateForm()) {
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

    CheckoutManager.registerGuest = function () {
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
    new PlentyFunction('[data-plenty-checkout-form="customerLogin"]', function (elem) {
        $(elem).on('submit', function () {
            CheckoutManager.registerGuest().done(function () {
                CheckoutManager.saveShippingAddress().done(function () {
                    registrationDone = true;
                    CheckoutManager.Navigator.goTo(targetContainer.index);
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
    CheckoutManager.updateGuestInvoiceAddress = function () {
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
        for (var key in invoiceAddress) {
            console.log(key + ' - ' + CheckoutManager.checkout.CustomerInvoiceAddress[key] + ' - ' + invoiceAddress[key]);
            if (CheckoutManager.checkout.CustomerInvoiceAddress[key] + '' !== invoiceAddress[key] + '' && key !== 'EmailRepeat') {
                console.log('		--> difference found ' + typeof CheckoutManager.checkout.CustomerInvoiceAddress[key] + ' - ' + typeof invoiceAddress[key]);
                hasChanges = true;
                break;
            }
        }

        if (hasChanges) {
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
    CheckoutManager.updateGuestAddresses = function () {

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
        if ($('[name="shippingAddressID"]:checked').val() < 0) {
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

        if (hasChangesInvoiceAddress) {
            promise = CheckoutManager.setInvoiceAddress(invoiceAddress);
        }

        if (hasChangesShippingAddress) {

            if (!promise) {
                promise = CheckoutManager.saveShippingAddress(shippingAddress);
            }
            else {
                promise.done(function () {
                    CheckoutManager.saveShippingAddress(shippingAddress);
                });
            }
        }

        if (!!promise) {
            return promise.done(function () {
                CheckoutManager.reloadCatContent(checkoutConfirmCatId);
                CheckoutManager.hideWaitScreen();
            });
        }

    };
})(jQuery);