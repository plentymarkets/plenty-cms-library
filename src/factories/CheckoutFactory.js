(function( $, pm )
{

    pm.factory( 'CheckoutFactory', function( API )
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
            updateBasketItemsList: updateBasketItemsList,
            getBasketItem: getBasketItem,
            addBasketItem: addBasketItem,
            updateBasketItem: updateBasketItem,
            deleteBasketItem: deleteBasketItem,
            placeOrder: placeOrder,
            loginTypes: {
                GUEST: 1,
                CUSTOMER: 2
            }
        };

        function init( sync )
        {
            return API.get( '/rest/checkout/', null, false, false, !!sync ).done(function(response) {
                checkout = response.data;
            } );
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
                // check for changed data
                if( !localData.hasOwnProperty( key ) )
                {
                    // new property
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

                if( $.isArray( remoteData[key] ) && $.isArray( localData[key] )
                    && remoteData[key].length !== localData[key].length )
                {
                    // array size changed
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

                if( typeof( remoteData[key] ) === "object" && !!remoteData[key] )
                {
                    // compare recursive
                    if( syncCheckout( remoteData[key], localData[key], parentPropertyName + "." + key ) )
                    {
                        localData[key] = remoteData[key];
                        hasChanges = true;
                    }
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
                );
            }

            if( parentPropertyName == "Checkout" )
            {
                checkout = localData;
            }

            return hasChanges;
        }


        function compareToLocal( remoteData, localData, flat )
        {
            flat = !!flat;

            if( remoteData === localData || parseFloat( remoteData ) === localData )
            {
                return true;
            }

            if( !!localData && !remoteData )
            {
                return false;
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

                if( !flat && !compareToLocal(remoteData[key], localData[key]) )
                {
                    return false;
                }
            }

            for ( var key in localData )
            {
                if ( localData.hasOwnProperty( key ) && !remoteData.hasOwnProperty( key ) )
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
                        syncCheckout({
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
            if( !checkout ) init(true);

            if( !compareToLocal( basketItemsList, checkout.BasketItemsList ) )
            {
                return API.post( '/rest/checkout/basketitemslist/', basketItemsList )
                    .done(function( response ) {
                        syncCheckout( {
                            BasketItemsList: response.data
                        } );
                    } );
            }

            return API.idle( checkout.BasketItemsList );
        }

        function updateBasketItemsList( basketItemsList )
        {
            if( !compareToLocal( basketItemsList, checkout.BasketItemsList ) )
            {
                return API.put( '/rest/checkout/basketitemslist/', basketItemsList )
                    .done(function( response ) {
                        syncCheckout( {
                            BasketItemsList: response.data
                        } );
                    } );
            }

            return API.idle( checkout.BasketItemsList );
        }

        function getBasketItem( BasketItemID )
        {
            var basketItems = checkout.BasketItemsList.length;
            for ( var i = 0; i < basketItems; i++ )
            {
                if ( checkout.BasketItemsList[i].BasketItemID == BasketItemID )
                {
                    return checkout.BasketItemsList[i];
                }
            }

            return null;
        }

        function addBasketItem( BasketItem )
        {
            return setBasketItemsList( [BasketItem] );
        }

        function updateBasketItem( BasketItem )
        {
            return updateBasketItemsList( [BasketItem] );
        }

        function deleteBasketItem( BasketItemID )
        {
            return API.delete( '/rest/checkout/basketitemslist/?basketItemIdsList[0]=' + BasketItemID )
                .done( function( response )
                {
                    syncCheckout( {
                        BasketItemsList: response.data
                    } );
                } );
        }



        function placeOrder( params )
        {
            return API.post( '/rest/checkout/placeorder', params );
        }

    }, ['APIFactory'] );

})( jQuery, PlentyFramework );