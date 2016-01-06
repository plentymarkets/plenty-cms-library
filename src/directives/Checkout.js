(function( $, pm )
{
    pm.directive( 'Checkout', function( CheckoutFactory, ModalFactory, CMSFactory ) {

        return {
            init: init,
            saveOrderDetails: saveOrderDetails,
            saveShippingAddress: saveShippingAddress,
            registerGuest: registerGuest,
            saveShippingProfile: saveShippingProfile,
            saveMethodOfPayment: saveMethodOfPayment,
            preparePayment: preparePayment,
            showPaymentInformation: showPaymentInformation,
            saveBankDetails: saveBankDetails,
            saveCreditCard: saveCreditCard,
            placeOrder: placeOrder

        };

        function init() {

            CheckoutFactory.init();
            CheckoutFactory.watch( 'Checkout', function() {
                CMSFactory.reloadContainer( "MethodsOfPaymentList" );
                CMSFactory.reloadContainer( "ShippingProfileList" );

                if( CheckoutFactory.getCheckout.CustomerInvoiceAddress.LoginType == CheckoutFactory.LoginType.CUSTOMER )
                {
                    CMSFactory.reloadContainer( "CustomerShippingAddress" );
                }
            });

        }

        function saveOrderDetails()
        {
            var $form = $( '[data-plenty-checkout-form="details"]' );
            var orderDetails = $form.getFormValues();
            CheckoutFactory.setCheckout({
                CheckoutCustomerSign: orderDetails.CustomerSign,
                CheckoutOrderInfoText: orderDetails.OrderInfoText
            });
        }

        function saveShippingAddress()
        {
            var $form = $( '[data-plenty-checkout-form="shippingAddress"]' );
            var shippingAddress = $form.getFormValues();

            if( shippingAddress.shippingAddressID < 0 )
            {
                if ( shippingAddress.Street == "PACKSTATION" )
                {
                    shippingAddress.IsPackstation = 1;
                    shippingAddress.PackstationNo = shippingAddress.HouseNo;
                }
                else if ( shippingAddress.Street == "POSTFILIALE" )
                {
                    shippingAddress.IsPostfiliale = 1;
                    shippingAddress.PostfilialNo  = shippingAddress.HouseNo;
                }

                CheckoutFactory.setShippingAddress( shippingAddress );
            }
            else
            {
                CheckoutFactory.setCheckout({
                    CheckoutCustomerShippingAddressID: shippingAddress.shippingAddressID
                });
            }
        }

        function registerGuest()
        {
            var $form = $( '[data-plenty-checkout-form="guestRegistration"]' );
            var invoiceAddress = $form.getFormValues();

            invoiceAddress.LoginType = 1;
            invoiceAddress.CustomerPropertiesList = invoiceAddress.CustomerPropertiesList || [];

            $form.find( "[data-plenty-property-id]" ).each( function( i, propertyInput )
            {
                invoiceAddress.CustomerPropertiesList.push( {
                    PropertyID   : $( propertyInput ).attr( 'data-plenty-property-id' ),
                    PropertyValue: $( propertyInput ).val()
                } );
            } );

            CheckoutFactory.setInvoiceAddress( invoiceAddress )
                .done(function(){
                    saveShippingAddress();
                });
        }

        function saveShippingProfile()
        {
            var shippingProfile = $( '[data-plenty-checkout-form="shippingProfileSelect"]' ).getFormValues();
            CheckoutFactory.setCheckout({
                CheckoutShippingProfileID: shippingProfile.ShippingProfileID
            });
        }

        function saveMethodOfPayment( paymentID )
        {
            paymentID = paymentID || $( '[data-plenty-checkout-form="methodOfPayment"]' ).getFormValues().MethodOfPaymentID;

            CheckoutFactory.setCheckout({
                CheckoutMethodOfPaymentID: paymentID
            });
        }

        function preparePayment()
        {
            //TODO: implement method body
        }

        function showPaymentInformation( containerName, formName )
        {

            CMS.getContainer( containerName ).from( 'Checkout' )
                .done( function( response )
                {
                    ModalFactory.prepare()
                        .setContent( response.data[0] )
                        .onDismiss( function()
                        {
                            $( 'input[name="MethodOfPaymentID"]' ).each( function( i, radio )
                            {
                                if ( $( radio ).val() == Checkout.getCheckout().CheckoutMethodOfPaymentID )
                                {
                                    $( radio ).attr( 'checked', 'checked' );
                                }
                                else
                                {
                                    $( radio ).removeAttr( 'checked' );
                                }
                            } );
                        } )
                        .onConfirm( function()
                        {
                            if ( $( '[data-plenty-checkout-form="' + formName + '"]' ).validateForm() )
                            {
                                if( containerName == 'CheckoutPaymentInformationCreditCard' )
                                {
                                    saveCreditCard();
                                }
                                else if ( containerName == 'CheckoutPaymentInformationBankDetails' )
                                {
                                    saveBankDetails();
                                }
                                return true;
                            }
                            else
                            {
                                return false;
                            }
                        } )
                        .show();
                } );

        }

        function saveBankDetails()
        {
            var $form = $( '[data-plenty-checkout-form="bankDetails"]' );
            var values = $form.getFormValues().checkout.customerBankDetails;

            var bankDetails = {
                CustomerBankName     : values.bankName,
                CustomerBLZ          : values.blz,
                CustomerAccountNumber: values.accountNo,
                CustomerAccountOwner : values.accountOwner,
                CustomerIBAN         : values.iban,
                CustomerBIC          : values.bic
            };

            CheckoutFactory.setBankDetails( bankDetails );
        }

        function saveCreditCard()
        {
            var $form = $( '[data-plenty-checkout-form="creditCard"]' );
            var values = $form.getFormValues().checkout.customerBankDetails;

            var creditCard = {
                Owner   : values.owner,
                Cvv2    : values.cvv2,
                Number  : values.number,
                Year    : values.year,
                Month   : values.month,
                Provider: values.provider
            };

            CheckoutFactory.setCreditCardInformation( creditCard );
        }

        function placeOrder()
        {
            var $form = $( '[data-plenty-checkout-form="placeOrder"]' );

            var values = $form.getFormValues();

            // if not shown in layout set default 1 for mandatory fields
            var params = {
                TermsAndConditionsCheck      : values.termsAndConditionsCheck || 0,
                WithdrawalCheck              : values.withdrawalCheck || 0,
                PrivacyPolicyCheck           : values.privacyPolicyCheck || 0,
                AgeRestrictionCheck          : values.ageRestrictionCheck || 0,
                NewsletterCheck              : values.newsletterCheck || 0,
                KlarnaTermsAndConditionsCheck: values.klarnaTermsAndConditionsCheck || 0,
                PayoneDirectDebitMandateCheck: values.payoneDirectDebitMandateCheck || 0,
                PayoneInvoiceCheck           : values.payoneInvoiceCheck || 0
            };

            CheckoutFactory.placeOrder( params )
                .done( function( response )
                {
                    if ( response.data.MethodOfPaymentRedirectURL != '' )
                    {
                        window.location.assign( response.data.MethodOfPaymentRedirectURL );
                    }
                    else if ( response.data.MethodOfPaymentAdditionalContent != '' )
                    {
                        ModalFactory.prepare()
                            .setContent( response.data.MethodOfPaymentAdditionalContent )
                            .setLabelDismiss( '' )
                            .onDismiss( function()
                            {
                                window.location.assign( $form.attr( 'action' ) );
                            } )
                            .onConfirm( function()
                            {
                                window.location.assign( $form.attr( 'action' ) );
                            } )
                            .show();

                    }
                    else
                    {
                        window.location.assign( $form.attr( 'action' ) );
                    }
                } );
        }
    }, ['CheckoutFactory', 'ModalFactory', 'CMSFactory'] );
})(jQuery, PlentyFramework);