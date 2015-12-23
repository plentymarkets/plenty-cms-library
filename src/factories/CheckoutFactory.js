(function( $, pm )
{

    pm.factory( 'CheckoutFactory2', function( API )
    {

        var watcherList = {};
        var checkout    = null;

        return {
            init : init,
            watch: watch,
            getCheckout: getCheckout,
            setCheckout: setCheckout,
            getInvoiceAddress: getInvoiceAddress,
            setInvoiceAddress: setInvoiceAddress,
            getShippingAddress: getShippingAddress,
            setShippingAddress: setShippingAddress,
            getBankDetails: getBankDetails,
            setBankDetails: setBankDetails,
            getCreditCardInformation: getCreditCardInformation,
            setCreditCardInformation: setCreditCardInformation,
            getBasketItemsList: getBasketItemsList,
            setBasketItemsList: setBasketItemsList,
            placeOrder: placeOrder
        };

        function init()
        {
            return API.get( '/rest/checkout/' ).done(function(response) {
                checkout = response.data;
            });
        }

        function watch( propertyName, callback )
        {
            if ( !watcherList.hasOwnProperty( propertyName ) )
            {
                watcherList[propertyName] = [];
            }

            watcherList[propertyName].push( callback );
        }

        function notify( propertyName, args )
        {
            if ( watcherList.hasOwnProperty( propertyName ) )
            {
                for ( var i = 0; i < watcherList[propertyName].length; i++ )
                {
                    watcherList[propertyName][i].apply( null, args );
                }
            }
        }

        function syncCheckout( remoteData, localData, parentPropertyName )
        {
            localData = localData || checkout;
            parentPropertyName = parentPropertyName || 'Checkout';
            var hasChanges = false;

            for( var key in remoteData )
            {
                if( !localData.hasOwnProperty( key ) )
                {
                    console.error( 'Property "' + key + '" does not exist in "' + parentPropertyName + '"');
                    break;
                }

                if( typeof( remoteData[key] ) === "object" )
                {
                    syncCheckout( remoteData[key], localData[key], parentPropertyName + "." + key );
                    continue;
                }

                if( remoteData[key] !== localData[key] )
                {
                    // property has changed
                    notify(
                        parentPropertyName + "." + key,
                        [
                            localData[key],
                            remoteData[key]
                        ]
                    );
                    localData[key] = remoteData[key];
                    hasChanges = true;
                    continue;
                }
            }

            if( hasChanges )
            {
                notify(
                    parentPropertyName,
                    [
                        localData,
                        remoteData
                    ]
                )
            }
        }

        function compareToLocal( remoteData, localData, flat )
        {
            flat = !!flat;

            if( remoteData === localData || parseFloat( remoteData ) === localData )
            {
                return true;
            }

            for( var key in remoteData )
            {
                if( !remoteData.hasOwnProperty( key ) )
                {
                    continue;
                }

                if( !localData.hasOwnProperty( key ) )
                {
                    return false;
                }

                if( remoteData[key] === localData[key] || parseFloat( remoteData[key] ) === localData[key] )
                {
                    continue;
                }

                if( !remoteData[key] && !localData[key] )
                {
                    // falsy values should be equal (null == undefined)
                    continue;
                }

                if( !flat && typeof(remoteData[key]) !== "object" )
                {
                    return false;
                }

                if( !flat && !compareToLocal(remoteData, remoteData) )
                {
                    return false;
                }
            }

            return true;
        }

        function getCheckout()
        {
            return checkout;
        }

        function setCheckout( data )
        {
            if( !compareToLocal( data, checkout ) )
            {
                return API.put( '/rest/checkout/', data ).done( function( response )
                {
                    // detect changed data and notify watchers
                    syncCheckout( response.data );
                } );
            }

            return API.idle( checkout );
        }

        function getInvoiceAddress()
        {
            return checkout.CustomerInvoiceAddress;
        }

        function setInvoiceAddress( invoiceAddress )
        {
            if( !compareToLocal( invoiceAddress, checkout.CustomerInvoiceAddress ) )
            {
                return API.pos( '/rest/checkout/customerinvoiceaddress/', invoiceAddress )
                    .done( function( response ) {
                        syncCheckout({
                           CustomerInvoiceAddress: response.data
                        });
                    });
            }

            return API.idle( checkout.CustomerInvoiceAddress );
        }

        function getShippingAddress()
        {
            return checkout.CustomerShippingAddress;
        }

        function setShippingAddress( shippingAddress )
        {
            if( !compareToLocal( shippingAddress, checkout.CustomerShippingAddress ) )
            {
                return API.post( '/rest/checkout/customershippingaddress/', shippingAddress )
                    .done( function( response ) {
                        syncCheckout( {
                            CustomerShippingAddress: response.data
                        });
                    });
            }

            return API.idle( checkout.CustomerShippingAddress );
        }

        function getBankDetails()
        {
            return checkout.PaymentInformationBankDetails;
        }

        function setBankDetails( bankDetails )
        {
            if( !compareToLocal( bankDetails, checkout.PaymentInformationBankDetails ) )
            {
                return API.post( '/rest/checkout/paymentinformationbankdetails', bankDetails )
                    .done( function( response ) {
                        syncCheckout({
                            PaymentInformationBankDetails: response.data
                        });
                    });
            }

            return API.idle( checkout.PaymentInformationBankDetails );
        }

        function getCreditCardInformation()
        {
            return checkout.PaymentInformationBankDetails;
        }

        function setCreditCardInformation( creditCardInformation )
        {
            if( !compareToLocal( creditCardInformation, checkout.PaymentInformationCreditCard ) )
            {
                return API.post( '/rest/checkout/paymentinformationcreditcard', creditCardInformation )
                    .done( function( response ) {
                        syncCheckout({
                            PaymentInformationCreditCard: response.data
                        });
                    });
            }

            return API.idle( checkout.PaymentInformationCreditCard );
        }

        function getBasketItemsList()
        {
            return checkout.BasketItemsList;
        }

        function setBasketItemsList( basketItemsList )
        {
            if( !compareToLocal( basketItemsList, checkout.BasketItemsList ) )
            {
                return API.post( '/rest/checkout/basketitemslist/', basketItemsList )
                    .done(function( response ) {
                        syncCheckout( response.data, checkout.BasketItemsList );
                    } );
            }
        }

        function placeOrder( params )
        {
            return API.post( '/rest/checkout/placeorder', params );
        }

    }, ['APIFactory'] );

})( jQuery, PlentyFramework );