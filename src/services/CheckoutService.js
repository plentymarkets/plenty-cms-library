/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function( $, pm )
{

    /**
     * Providing methods for checkout process like setting shipping & payment information and placing the order.<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CMSFactory"}}CMSFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CheckoutFactory"}}CheckoutFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "ModalFactory"}}ModalFactory{{/crossLink}}</li>
     * </ul>
     * @class CheckoutService
     * @static
     */
    pm.service( 'CheckoutService', function( API, CMS, Checkout, Modal )
    {

        return {
            init                  : init,
            setCustomerSignAndInfo: setCustomerSignAndInfo,
            registerGuest         : registerGuest,
            setShippingProfile    : setShippingProfile,
            saveShippingAddress   : saveShippingAddress,
            loadAddressSuggestion : loadAddressSuggestion,
            preparePayment        : preparePayment,
            setMethodOfPayment    : setMethodOfPayment,
            editBankDetails       : editBankDetails,
            editCreditCard        : editCreditCard,
            placeOrder            : placeOrder
        };

        /**
         * Load checkout data initially on page load
         * @function init
         */
        function init()
        {
            Checkout.loadCheckout( true );
        }

        /**
         * Read customer sign and order information text from &lt;form> marked with
         * <b>data-plenty-checkout-form="details"</b> and update checkout.
         * @function setCustomerSignAndInfo
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function setCustomerSignAndInfo()
        {
            var form   = $( '[data-plenty-checkout-form="details"]' );
            var values = form.getFormValues();

            // initialize CustomerSign & InfoText to avoid updating empty values
            if ( !Checkout.getCheckout().CheckoutCustomerSign )
            {
                Checkout.getCheckout().CheckoutCustomerSign = "";
            }
            if ( !Checkout.getCheckout().CheckoutOrderInfoText )
            {
                Checkout.getCheckout().CheckoutOrderInfoText = "";
            }

            if ( ( Checkout.getCheckout().CheckoutCustomerSign !== values.CustomerSign && $( form ).find( '[name="CustomerSign"]' ).length > 0 )
                || ( Checkout.getCheckout().CheckoutOrderInfoText !== values.OrderInfoText && $( form ).find( '[name="OrderInfoText"]' ).length > 0 ) )
            {

                Checkout.getCheckout().CheckoutCustomerSign  = values.CustomerSign;
                Checkout.getCheckout().CheckoutOrderInfoText = values.OrderInfoText;

                return Checkout.setCheckout();

            }
            else
            {
                // No changes detected -> Do nothing
                return API.idle();
            }
        }

        /**
         * Read address data from &lt;form> marked with <b>data-plenty-checkout-form="shippingAddress"</b>.
         * Create new shipping address or update the shipping address ID.
         * @function saveShippingAddress
         * @param {boolean} [validateForm = false] validate form before processing requests
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function saveShippingAddress( validateForm )
        {
            var form = $( '[data-plenty-checkout-form="shippingAddress"]' );

            if ( !validateForm && !form.validateForm() )
            {
                return false;
            }

            if ( !validateForm && !pm.getInstance().AddressDoctorService.validateAddress( form ) )
            {
                return false;
            }

            var values            = form.getFormValues();
            var shippingAddressID = $( '[name="shippingAddressID"]:checked' ).val();

            // TODO: move bootstrap specific function
            $( '#shippingAdressSelect' ).modal( 'hide' );

            if ( shippingAddressID < 0 )
            {
                // save separate
                var shippingAddress = values;

                if ( !addressesAreEqual( shippingAddress, Checkout.getCheckout().CustomerShippingAddress ) )
                {
                    if( shippingAddress.Street == "PACKSTATION" )
                    {
                        shippingAddress.isPackstation = 1;
                        shippingAddress.PackstationNo = shippingAddress.HouseNo;
                    }
                    else if( shippingAddress.Street == "POSTFILIALE" )
                    {
                        shippingAddress.isPostfiliale = 1;
                        shippingAddress.PostfilialNo = shippingAddress.HouseNo;
                    }

                    // new shipping address
                    return API.post( "/rest/checkout/customershippingaddress/", shippingAddress )
                        .done( function( response )
                        {

                            Checkout.getCheckout().CheckoutCustomerShippingAddressID = response.data.ID;
                            Checkout.getCheckout().CheckoutShippingCountryID         = response.data.CountryID;
                            delete Checkout.getCheckout().CheckoutMethodOfPaymentID;
                            delete Checkout.getCheckout().CheckoutShippingProfileID;

                            Checkout.setCheckout().done( function()
                            {
                                if ( Checkout.getCheckout().CustomerInvoiceAddress.LoginType == 2 )
                                {
                                    Checkout.reloadContainer( 'CustomerShippingAddress' );
                                }
                            } );
                        } );
                }
                else
                {
                    // no changes detected
                    return API.idle();
                }

            }
            else
            {
                if ( shippingAddressID != Checkout.getCheckout().CheckoutCustomerShippingAddressID )
                {
                    // change shipping address id
                    Checkout.getCheckout().CheckoutCustomerShippingAddressID = shippingAddressID;
                    delete Checkout.getCheckout().CheckoutMethodOfPaymentID;
                    delete Checkout.getCheckout().CheckoutShippingProfileID;

                    return Checkout.setCheckout().done( function()
                    {
                        if ( Checkout.getCheckout().CustomerInvoiceAddress.LoginType == 2 )
                        {
                            Checkout.reloadContainer( 'CustomerShippingAddress' );
                        }
                    } );
                }
                else
                {
                    return API.idle();
                }
            }
        }

        /**
         * Prepare address-data to register a guest. Reads the address-data from a &lt;form> marked with
         * <b>data-plenty-checkout-form="guestRegistration"</b>
         * @function registerGuest
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function registerGuest()
        {
            var form = $( '[data-plenty-checkout-form="guestRegistration"]' );

            var invoiceAddress       = form.getFormValues();
            invoiceAddress.LoginType = 1;

            invoiceAddress.CustomerPropertiesList = invoiceAddress.CustomerPropertiesList || [];

            form.find( "[data-plenty-property-id]" ).each( function( i, propertyInput )
            {

                invoiceAddress.CustomerPropertiesList.push( {
                    PropertyID   : $( propertyInput ).attr( 'data-plenty-property-id' ),
                    PropertyValue: $( propertyInput ).val()
                } );
            } );

            if ( !addressesAreEqual( invoiceAddress, Checkout.getCheckout().CustomerInvoiceAddress ) )
            {

                return API.post( "/rest/checkout/customerinvoiceaddress/", invoiceAddress )
                    .done( function( response )
                    {
                        saveShippingAddress().done( function()
                        {
                            Checkout.getCheckout().CustomerInvoiceAddress = response.data;
                        } );
                    } );

            }
            else
            {

                return saveShippingAddress();

            }
        }

        /**
         * Check if values of addresses are equal
         * @function addressesAreEqual
         * @private
         * @param {object} address1
         * @param {object} address2
         * @returns {boolean}
         */
        function addressesAreEqual( address1, address2 )
        {
            for ( var key in address1 )
            {
                if ( address1[key] + '' !== address2[key] + '' && key !== 'EmailRepeat' )
                {
                    return false;
                }
            }
            return true;
        }

        /**
         * Set the shipping profile used for this order and update checkout. Selected shipping profile will be
         * read from &lt;form> marked with <b>data-plenty-checkout-form="shippingProfileSelect"</b>
         * @function setShippingProfile
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function setShippingProfile()
        {

            var values = $( '[data-plenty-checkout-form="shippingProfileSelect"]' ).getFormValues();

            Checkout.getCheckout().CheckoutShippingProfileID = values.ShippingProfileID;
            delete Checkout.getCheckout().CheckoutCustomerShippingAddressID;
            delete Checkout.getCheckout().CheckoutMethodOfPaymentID;

            return Checkout.setCheckout()
                .done( function()
                {
                    Checkout.reloadContainer( 'MethodsOfPaymentList' );
                } );

        }

        /**
         * Prepare method of payment to check if external checkout is used or addition content should be displayed
         * @function preparePayment
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function preparePayment()
        {
            return API.post( "/rest/checkout/preparepayment/", null )
                .done( function( response )
                {
                    if ( response.data.CheckoutMethodOfPaymentRedirectURL != '' )
                    {

                        document.location.assign( response.data.CheckoutMethodOfPaymentRedirectURL );

                    }
                    else if ( !!response.data.CheckoutMethodOfPaymentAdditionalContent )
                    {

                        var isBankDetails = $( response.data.CheckoutMethodOfPaymentAdditionalContent ).find( '[data-plenty-checkout-form="bankDetails"]' ).length > 0;
                        Modal.prepare()
                            .setContent( response.data.CheckoutMethodOfPaymentAdditionalContent )
                            .onConfirm( function()
                            {
                                if ( isBankDetails )
                                {
                                    return saveBankDetails();
                                }
                                else
                                {
                                    return saveCreditCard();
                                }
                            } )
                            .show();
                    }
                } );

        }

        /**
         * Set the method of payment used for this order.
         * @function setMethodOfPayment
         * @param {number|undefined} paymentID  ID of the method of payment to use. Read from &lt;form> marked with
         *                                      <b>data-plenty-checkout-form="methodOfPayment"</b> if unset.
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function setMethodOfPayment( paymentID )
        {

            paymentID = paymentID || $( '[data-plenty-checkout-form="methodOfPayment"]' ).getFormValues().MethodOfPaymentID;

            Checkout.getCheckout().CheckoutMethodOfPaymentID = paymentID;
            delete Checkout.getCheckout().CheckoutCustomerShippingAddressID;
            delete Checkout.getCheckout().CheckoutShippingProfileID;

            return Checkout.setCheckout()
                .done( function()
                {
                    Checkout.reloadContainer( 'ShippingProfilesList' );
                } );
        }

        /**
         * Display the popup to enter or edit customers bank details
         * @function editBankDetails
         */
        function editBankDetails()
        {

            CMS.getContainer( 'CheckoutPaymentInformationBankDetails' ).from( 'Checkout' )
                .done( function( response )
                {
                    Modal.prepare()
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
                        } ).onConfirm( function()
                        {
                            return saveBankDetails();
                        } )
                        .show();
                } );

        }

        /**
         * Read entered bank details from <b>data-plenty-checkout-form="bankDetails"</b> and update checkout.
         * @function saveBankDetails
         * @private
         * @return {boolean} the result of form validation
         */
        function saveBankDetails()
        {
            var form = $( '[data-plenty-checkout-form="bankDetails"]' );

            if ( form.validateForm() )
            {
                var values = form.getFormValues().checkout.customerBankDetails;

                var bankDetails = {
                    CustomerBankName     : values.bankName,
                    CustomerBLZ          : values.blz,
                    CustomerAccountNumber: values.accountNo,
                    CustomerAccountOwner : values.accountOwner,
                    CustomerIBAN         : values.iban,
                    CustomerBIC          : values.bic
                };

                API.post( "/rest/checkout/paymentinformationbankdetails/", bankDetails )
                    .done( function()
                    {
                        Checkout.loadCheckout().done( function()
                        {
                            setMethodOfPayment( 3 );
                            Checkout.reloadContainer( 'MethodsOfPaymentList' );
                        } );
                    } );
                return true;
            }
            else
            {
                return false;
            }
        }

        /**
         * Display a popup containing credit card form
         * @function editCreditCard
         */
        function editCreditCard()
        {

            CMS.getContainer( 'CheckoutPaymentInformationCreditCard' ).from( 'Checkout' )
                .done( function( response )
                {
                    Modal.prepare()
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
                        } ).onConfirm( function()
                        {
                            return saveCreditCard();
                        } )
                        .show();
                } );
        }

        /**
         * Read values from &lt;form> marked with <b>data-plenty-checkout-form="creditCard"</b> and update checkout.
         * @function saveCreditCard
         * @private
         * @return {boolean} the result of form validation
         */
        function saveCreditCard()
        {
            var form = $( '[data-plenty-checkout-form="creditCard"]' );

            if ( form.validateForm() )
            {

                var values = form.getFormValues().checkout.paymentInformationCC;

                var creditCard = {
                    Owner   : values.owner,
                    Cvv2    : values.cvv2,
                    Number  : values.number,
                    Year    : values.year,
                    Month   : values.month,
                    Provider: values.provider
                };

                API.post( '/rest/checkout/paymentinformationcreditcard/', creditCard )
                    .done( function()
                    {
                        Checkout.loadCheckout();
                    } );
                return true;
            }
            else
            {
                return false;
            }
        }

        /**
         * Display a popup containing address suggestions
         * @param {string} type
         */
        function loadAddressSuggestion( type )
        {

            //check login type
            if ( Checkout.getCheckout().CustomerInvoiceAddress.LoginType == 2 )
            {
                var values = $( '[data-plenty-checkout-form="shippingAddress"]' ).getFormValues();
            }
            else
            {
                var values = $( '[data-plenty-checkout-form="guestRegistration"]' ).getFormValues();
            }

            var params = {
                street        : values.Street,
                houseNo       : values.HouseNo,
                ZIP           : values.ZIP,
                city          : values.City,
                postnummer    : values.Postnummer,
                suggestionType: 'postfinder'
            };

            CMS.getContainer( 'CheckoutAddressSuggestionResultsList', params ).from( 'Checkout' )
                .done( function( response )
                {
                    Modal.prepare()
                        .setContent( response.data[0] )
                        .show();
                } );
        }

        /**
         * Place the order prepared before and finish the checkout process.<br>
         * Validate required checkboxes in <b>data-plenty-checkout-form="placeOrder"</b>
         * @function placeOrder
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function placeOrder()
        {
            var form = $( '[data-plenty-checkout-form="placeOrder"]' );
            if ( form.validateForm() )
            {

                var values = form.getFormValues();

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

                return API.post( "/rest/checkout/placeorder/", params )
                    .done( function( response )
                    {
                        if ( response.data.MethodOfPaymentRedirectURL != '' )
                        {

                            window.location.assign( response.data.MethodOfPaymentRedirectURL );

                        }
                        else if ( response.data.MethodOfPaymentAdditionalContent != '' )
                        {

                            Modal.prepare()
                                .setContent( response.data.MethodOfPaymentAdditionalContent )
                                .setLabelDismiss( '' )
                                .onDismiss( function()
                                {
                                    window.location.assign( form.attr( 'action' ) );
                                } ).onConfirm( function()
                            {
                                window.location.assign( form.attr( 'action' ) );
                            } ).show();

                        }
                        else
                        {

                            window.location.assign( form.attr( 'action' ) );

                        }
                    } );
            }
        }

    }, ['APIFactory', 'CMSFactory', 'CheckoutFactory', 'ModalFactory'] );
}( jQuery, PlentyFramework ));