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
     * Providing methods for logging in and out and registering new customers.<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CheckoutFactory"}}CheckoutFactory{{/crossLink}}</li>
     * </ul>
     * @class AuthenticationService
     * @static
     */
    pm.service( 'AuthenticationService', function( API, Checkout, UI )
    {

        return {
            resetPassword    : resetPassword,
            customerLogin    : customerLogin,
            setInvoiceAddress: setInvoiceAddress,
            registerCustomer : registerCustomer
        };

        /**
         * Reading E-Mail from form marked with <b>data-plenty-checkout="lostPasswordForm"</b>
         * and sends request to provide a new password to the entered E-Mail-Address.
         *
         * @function resetPasswort
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function resetPassword()
        {

            var form = $( '[data-plenty-checkout="lostPasswordForm"]' );

            if ( form.validateForm() )
            {

                var values = form.getFormValues();

                var params = {
                    Email: values.Email
                };

                return API.post( "/rest/checkout/lostpassword/", params )
                    .done( function( response )
                    {
                        if ( response.data.IsMailSend == true )
                        {
                            $( '[data-plenty-checkout="lostPasswordTextContainer"]' ).hide();
                            $( '[data-plenty-checkout="lostPasswordSuccessMessage"]' ).show();
                        }
                    } );

            }
        }

        /**
         * Try to login in with credentials read from given &ltform> - element.
         * On success redirect to forms 'action' attribute.
         *
         * @function customerLogin
         * @param {object} form The jQuery-wrapped form-element to read the credentials from
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function customerLogin( form )
        {
            if ( form.validateForm() )
            {
                var values = form.getFormValues();

                var params = {
                    Email   : values.loginMail,
                    Password: values.loginPassword
                };

                UI.showWaitScreen();
                return API.post( "/rest/checkout/login/", params )
                    .done( function()
                    {
                        // successful login -> go to form's target referenced by action-attribute
                        window.location.assign( form.attr( 'action' ) );

                    } );
            }
        }

        /**
         * Setting the invoice address of a newly registered customer or a guest.
         *
         * @function setInvoiceAddress
         * @param {object} invoiceAddress containing address-data sent to server
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function setInvoiceAddress( invoiceAddress )
        {

            return API.post( "/rest/checkout/customerinvoiceaddress/", invoiceAddress )
                .done( function( response )
                {
                    Checkout.getCheckout().CustomerInvoiceAddress = response.data;
                } );
        }

        /**
         * Prepare address-data to register new customer. Read the address-data from a &lt;form> marked with
         * <b>data-plenty-checkout-form="customerRegistration"</b><br>
         * On success, redirect to forms target referenced by action-attribute
         *
         * @function registerCustomer
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function registerCustomer()
        {
            var form = $( '[data-plenty-checkout-form="customerRegistration"]' );

            if ( form.validateForm() && pm.getInstance().AddressDoctorService.validateAddress() )
            {
                var values       = form.getFormValues();
                values.LoginType = 2;

                if ( values.checkout
                    && values.checkout.customerInvoiceAddress
                    && values.checkout.customerInvoiceAddress.CustomerProperty )
                {
                    var tmpProperties             = values.checkout.customerInvoiceAddress.CustomerProperty;
                    values.CustomerPropertiesList = values.CustomerPropertiesList || [];

                    for ( var property in tmpProperties )
                    {
                        if ( tmpProperties[property] )
                        {
                            values.CustomerPropertiesList.push( {
                                PropertyID   : property,
                                PropertyValue: tmpProperties[property]
                            } );
                        }
                    }
                }

                return setInvoiceAddress( values )
                    .done( function()
                    {
                        window.location.assign( form.attr( 'action' ) );
                    } );
            }
        }
    }, ['APIFactory', 'CheckoutFactory', 'UIFactory'] );

}( jQuery, PlentyFramework ));