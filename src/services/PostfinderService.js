/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Magnus Martin <magnus.martin@plentymarkets.com>
 * =====================================================================================
 */


(function( $, pm )
{
    pm.service( 'PostfinderService', function( API, Modal, UIFactory )
    {
        var packstationID   = '';
        var shippingFields  = {};
        var numberOfResults = {};
        var result          = {};

        return {
            openPostfinderModal: openPostfinderModal,
            isPackstation      : isPackstation
        };

        function isPackstation()
        {
            var street = $( 'input[name="Street"]' ).val();
            return ( street.toUpperCase() == "PACKSTATION" || street.toUpperCase() == "POSTFILIALE" );
        }

        function openPostfinderModal()
        {
            shippingFields = {
                PostfinderItemStreet : $( 'input[name="Street"]', '[data-plenty-checkout-form="shippingAddress"]' ),
                PostfinderItemZIP    : $( 'input[name="ZIP"]', '[data-plenty-checkout-form="shippingAddress"]' ),
                PostfinderItemCity   : $( 'input[name="City"]', '[data-plenty-checkout-form="shippingAddress"]' ),
                PostfinderItemHouseNo: $( 'input[name="HouseNo"]', '[data-plenty-checkout-form="shippingAddress"]' )

            };

            shippingFields.PostfinderItemStreet.val( '' );

            if ( (shippingFields.PostfinderItemZIP.val().length > 2 || shippingFields.PostfinderItemCity.val().length > 2) )
            {

                API.get( '/rest/checkout/shippingaddresspostfinderlist/',
                    {
                        suggestionType: "postfinder",
                        zip           : shippingFields.PostfinderItemZIP.val(),
                        city          : shippingFields.PostfinderItemCity.val()
                    } )

                    .done( function( response )
                    {
                        result          = response.data;
                        numberOfResults = result.length;

                        if ( numberOfResults == 0 )
                        {
                            showErrorMessage();
                        }

                        var params = {
                            addresses: []
                        };

                        for ( var i = 0; i < numberOfResults; i++ )
                        {
                            var dimension        = 'km';
                            var distInMeters     = result[i].PostfinderItemDistance;
                            var distInKilometers = distInMeters / 1000;
                            distInKilometers     = ((Math.round( distInKilometers * 100 ) / 100).toFixed( 2 )).replace( '.', ',' );

                            if ( distInMeters < 1000 )
                            {
                                distInKilometers = distInMeters;
                                dimension        = 'm';
                            }

                            params.addresses.push( {
                                index    : i,
                                dimension: dimension,
                                type     : result[i].PostfinderItemIsPackstation ? 'Packstation' : 'Postfiliale',
                                number   : result[i].PostfinderItemIsPackstation ? result[i].PostfinderItemPackstationNo : result[i].PostfinderItemPostfilialNo,
                                street   : result[i].PostfinderItemStreet,
                                houseNo  : result[i].PostfinderItemHouseNo,
                                zip      : result[i].PostfinderItemZIP,
                                city     : result[i].PostfinderItemCity,
                                district : result[i].PostfinderItemDistrict,
                                distance : distInKilometers,
                                remark   : result[i].PostfinderItemRemark
                            } );
                        }

                        var html = pm.compileTemplate( 'addressSuggestions/postFinder.html', params );

                        Modal.prepare()
                            .setTitle( pm.translate( 'Packstation.yourArea' ) )
                            .setContent( html )
                            .setClass( 'checkout' )
                            .onConfirm( function()
                            {
                                shippingFields.PostfinderItemCity.removeClass( 'has-error' ).addClass( 'has-success' );
                                $( 'label[for="' + shippingFields.PostfinderItemCity.attr( 'id' ) + '"]' ).removeClass( 'has-error' ).addClass( 'has-success' );

                                shippingFields.PostfinderItemZIP.removeClass( 'has-error' ).addClass( 'has-success' );
                                $( 'label[for="' + shippingFields.PostfinderItemZIP.attr( 'id' ) + '"]' ).removeClass( 'has-error' ).addClass( 'has-success' );

                                shippingFields.PostfinderItemStreet.removeClass( 'has-error' ).addClass( 'has-success' );
                                $( 'label[for="' + shippingFields.PostfinderItemStreet.attr( 'id' ) + '"]' ).removeClass( 'has-error' ).addClass( 'has-success' );

                                shippingFields.PostfinderItemHouseNo.removeClass( 'has-error' ).addClass( 'has-success' );
                                $( 'label[for="' + shippingFields.PostfinderItemHouseNo.attr( 'id' ) + '"]' ).removeClass( 'has-error' ).addClass( 'has-success' );

                                packstationID = $( 'input[type="radio"][name="postfinder"]:checked' ).val();

                                if ( result[packstationID].PostfinderItemIsPackstation )
                                {
                                    $( shippingFields.PostfinderItemStreet ).val( 'PACKSTATION' );
                                    $( shippingFields.PostfinderItemHouseNo ).val( result[packstationID].PostfinderItemPackstationNo );
                                }
                                else
                                {
                                    $( shippingFields.PostfinderItemStreet ).val( 'POSTFILIALE' );
                                    $( shippingFields.PostfinderItemHouseNo ).val( result[packstationID].PostfinderItemPostfilialNo );
                                }
                                $( shippingFields.PostfinderItemStreet ).trigger( 'change' );

                                $( shippingFields.PostfinderItemCity ).val( result[packstationID].PostfinderItemCity );
                                $( shippingFields.PostfinderItemZIP ).val( result[packstationID].PostfinderItemZIP );
                                return true;
                            } )
                            .show()
                    } );
            }
            else
            {
                showErrorMessage();
            }

        }

        function showErrorMessage()
        {
            UIFactory.throwError( 0, pm.translate( 'Enter.ZipOrCity' ) );

            shippingFields.PostfinderItemCity.removeClass( 'has-success' ).addClass( 'has-error' );
            $( 'label[for="' + shippingFields.PostfinderItemCity.attr( 'id' ) + '"]' ).removeClass( 'has-success' ).addClass( 'has-error' );

            shippingFields.PostfinderItemZIP.removeClass( 'has-success' ).addClass( 'has-error' );
            $( 'label[for="' + shippingFields.PostfinderItemZIP.attr( 'id' ) + '"]' ).removeClass( 'has-success' ).addClass( 'has-error' );

            shippingFields.PostfinderItemCity.focus( function()
            {
                $( this ).removeClass( 'has-error' );
                var inputId = $( this ).attr( 'id' );
                $( this ).closest( '.form-group' ).find( '[for="' + inputId + '"]' ).removeClass( 'has-error' );
            } );

            shippingFields.PostfinderItemZIP.focus( function()
            {
                $( this ).removeClass( 'has-error' );
                var inputId = $( this ).attr( 'id' );
                $( this ).closest( '.form-group' ).find( '[for="' + inputId + '"]' ).removeClass( 'has-error' );
            } );
        }
    }, ['APIFactory', 'ModalFactory', 'UIFactory'] );

}( jQuery, PlentyFramework ));