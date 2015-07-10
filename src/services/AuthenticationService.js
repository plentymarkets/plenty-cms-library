(function (pm) {

    /****************************************
     *        LOGIN & REGISTRATION          *
     ****************************************/
    pm.service('AuthenticationService', function (API, UI, Checkout) {

        return {
            resetPassword: resetPassword,
            customerLogin: customerLogin,
            setInvoiceAddress: setInvoiceAddress,
            registerCustomer: registerCustomer,
            registerGuest: registerGuest,
            updateGuestInvoiceAddress: updateGuestInvoiceAddress,
            updateGuestAddresses: updateGuestAddresses
        };

        /**
         * Lost password
         *
         * @return    Promise
         */
        function resetPassword() {

            var form = $('[data-plenty-checkout="lostPasswordForm"]');

            if( form.validateForm() ) {

                var values = form.getFormValues();

                var params = {
                    Email: values.Email
                };

                UI.showWaitScreen();
                return API.post("/rest/checkout/lostpassword/", params)
                    .done(function( response ) {
                        if ( response.data.IsMailSend == true ) {
                            UI.hideWaitScreen();
                            $('[data-plenty-checkout="lostPasswordTextContainer"]').hide();
                            $('[data-plenty-checkout="lostPasswordSuccessMessage"]').show();
                        }
                    });

            }
        }

        /**
         * Handle customers login
         *
         * @return Promise
         */
        function customerLogin( form ) {
            if( form.validateForm() ) {
                var values = form.getFormValues();

                var params = {
                    Email: values.loginMail,
                    Password: values.loginPassword
                };

                UI.showWaitScreen();

                return API.post("/rest/checkout/login/", params)
                    .done(function () {
                        // successful login -> go to form's target referenced by action-attribute
                        window.location.href = form.attr('action');
                    });
            }
        }

        /**
         * Evaluate invoice address form,
         * modify checkout data and update checkout on server
         *
         * @param    invoiceAddress    object containing address-data sent to server via ReST-API
         * @return    Promise
         */
        function setInvoiceAddress( invoiceAddress ) {

            UI.showWaitScreen();

            return API.post("/rest/checkout/customerinvoiceaddress/", invoiceAddress)
                .done(function (response) {
                    Checkout.getCheckout().CustomerInvoiceAddress = response.data;
                });
        }

        /**
         * Prepare address-data to register new customer
         * on success, redirect to forms target referenced by action-attribute
         *
         * @return Promise
         */
        function registerCustomer() {
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

                return setInvoiceAddress(invoiceAddress)
                    .done(function () {
                        window.location.href = form.attr('action');
                    });
            }
        }

        /**
         * Prepare address-data to register a guest
         *
         * @return Promise
         */
        function registerGuest() {
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

            return setInvoiceAddress(invoiceAddress)
                .done(function() {
                    Checkout.reloadCatContent(checkoutConfirmCatId);
                });
        }

        /**
         * Update address-data to register a guest
         *
         * @return Promise
         */
        function updateGuestInvoiceAddress() {
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
                if ( Checkout.getCheckout().CustomerInvoiceAddress[key]+'' !== invoiceAddress[key]+'' && key !== 'EmailRepeat' ) {
                    hasChanges = true;
                    break;
                }
            }

            if ( hasChanges ) {
                UI.showWaitScreen();
                return setInvoiceAddress(invoiceAddress).done(function () {
                    Checkout.reloadCatContent(checkoutConfirmCatId);
                    UI.hideWaitScreen();
                });
            }

        }

        /**
         * Updatee shipping address-data for guest
         *
         * @return Promise
         */
        function updateGuestAddresses() {
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
                if (Checkout.getCheckout().CustomerInvoiceAddress[key] + '' !== invoiceAddress[key] + '' && key !== 'EmailRepeat') {
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
                    if (Checkout.getCheckout().CustomerShippingAddress[key] + '' !== shippingAddress[key] + '' && key !== 'EmailRepeat') {
                        hasChangesShippingAddress = true;
                        break;
                    }
                }
            }

            var promise;

            if ( hasChangesInvoiceAddress ) {
                promise = setInvoiceAddress(invoiceAddress);
            }

            if ( hasChangesShippingAddress ) {

                if ( ! promise ) {
                    promise = saveShippingAddress(shippingAddress);
                }
                else {
                    promise.done(function() {
                        saveShippingAddress(shippingAddress);
                    });
                }
            }

            if ( !! promise ) {
                return promise.done(function() {
                    Checkout.reloadCatContent(checkoutConfirmCatId);
                    UI.hideWaitScreen();
                });
            }
        }
    }, ['APIFactory', 'UIFactory', 'CheckoutFactory']);

}(PlentyFramework));