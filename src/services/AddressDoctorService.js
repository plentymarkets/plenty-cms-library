/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function( $, pm )
{
    pm.service( 'AddressDoctorService', function( API )
    {
        return {
            validateAddress: validateAddress
        };

        function validateAddress( addressForms )
        {
            var addressIsValid = true;
            addressForms = addressForms || '[data-plenty-address-doctor]';
            $( addressForms ).filter('[data-plenty-address-doctor]:visible').each( function( i, form )
            {
                var addressDoctor  = new AddressDoctor( form );
                var requiredFields = $( form ).attr( 'data-plenty-address-doctor' ).replace( /\s/g, '' ).split( ',' );
                if ( !addressDoctor.isValid( requiredFields ) )
                {
                    addressIsValid = false;
                }

            } );

            return addressIsValid;
        }

        function AddressDoctor( form )
        {
            var $form                = $( form );
            var $inputs              = {
                Street : $form.find( 'input[name="Street"]' ),
                ZIP    : $form.find( 'input[name="ZIP"]' ),
                City   : $form.find( 'input[name="City"]' ),
                HouseNo: $form.find( 'input[name="HouseNo"]' )
            };
            var $suggestionContainer = {};

            var suggestions;
            var requiredFields;

            return {
                isValid: isValid
            };

            function isValid( fields )
            {

                if ( isPackstation() )
                {
                    return true;
                }

                suggestions    = new AddressList( $form.getFormValues() );
                requiredFields = fields;

                refreshView();

                return suggestions.getAddresses().length == 1;
            }

            function refreshView()
            {
                $( '.suggestion-list' ).remove();

                var suggestionListVisible = false;
                for ( var i = 0; i < requiredFields.length; i++ )
                {
                    if ( !validateInput( requiredFields[i], suggestionListVisible ) )
                    {
                        $form.trigger( 'validationFailed' );
                        suggestionListVisible = true;
                    }
                }

                if ( suggestions.houseNoAllowed( $inputs.HouseNo.val() ) )
                {
                    $inputs.HouseNo.removeClass( 'has-error' );
                    $form.find( 'label[for="' + $inputs.HouseNo.attr( 'id' ) + '"]' ).removeClass( 'has-error' );

                    $inputs.HouseNo.addClass( 'has-success' );
                    $form.find( 'label[for="' + $inputs.HouseNo.attr( 'id' ) + '"]' ).addClass( 'has-success' );
                }
                else
                {
                    $inputs.HouseNo.removeClass( 'has-success' );
                    $form.find( 'label[for="' + $inputs.HouseNo.attr( 'id' ) + '"]' ).removeClass( 'has-success' );

                    $inputs.HouseNo.addClass( 'has-error' );
                    $form.find( 'label[for="' + $inputs.HouseNo.attr( 'id' ) + '"]' ).addClass( 'has-error' );
                }
            }

            function validateInput( key, suggestionListVisible )
            {
                var valueList = suggestions.getList( key );

                if ( !!$suggestionContainer[key] )
                {
                    $suggestionContainer[key].remove();
                }

                if ( !$inputs[key] )
                {
                    return true;
                }

                if ( valueList.length == 1 )
                {
                    $inputs[key].val( valueList[0] );

                    $inputs[key].removeClass( 'has-error' );
                    $form.find( 'label[for="' + $inputs[key].attr( 'id' ) + '"]' ).removeClass( 'has-error' );

                    $inputs[key].addClass( 'has-success' );
                    $form.find( 'label[for="' + $inputs[key].attr( 'id' ) + '"]' ).addClass( 'has-success' );
                    return true;
                }
                else
                {
                    $inputs[key].removeClass( 'has-success' );
                    $form.find( 'label[for="' + $inputs[key].attr( 'id' ) + '"]' ).removeClass( 'has-success' );

                    $inputs[key].addClass( 'has-error' );
                    $form.find( 'label[for="' + $inputs[key].attr( 'id' ) + '"]' ).addClass( 'has-error' );

                    if( !suggestionListVisible ) buildSuggestionList( $inputs[key], valueList );
                    $inputs[key].off( 'focus' );
                    $inputs[key].focus();
                    return false;

                }
            }

            function buildSuggestionList( $parent, values )
            {
                var suggestionKey = $parent.attr( 'name' );

                // render html content
                $suggestionContainer[suggestionKey] = $( pm.compileTemplate( 'addressSuggestions/addressDoctor.html', {values: values} ) );
                $suggestionContainer[suggestionKey].css( {
                    'width': $parent.outerWidth( true ),
                    'left' : $parent.position().left,
                    'top'  : $parent.position().top + $parent.outerHeight( true )
                } );

                // bind click event to list elements
                $suggestionContainer[suggestionKey].find( '[data-address-value]' ).each( function( i, elem )
                {

                    var $elem = $( elem );
                    var value = $elem.attr( 'data-address-value' );

                    $elem.click( function()
                    {
                        // insert clicked value in input
                        $parent.val( value );

                        // filter addresses and show remaining suggestions
                        var filterAddress                     = {};
                        filterAddress[$parent.attr( 'name' )] = value;
                        suggestions.filter( filterAddress );

                        // refresh suggestion lists
                        refreshView();

                    } );

                } );

                // inject html
                $parent.parent().append( $suggestionContainer[suggestionKey] );
            }

            function isPackstation()
            {
                return ( $inputs.Street.val().toUpperCase() == "PACKSTATION" || $inputs.Street.val().toUpperCase() == "POSTFILIALE" );
            }

        }

        function AddressList( addressInput )
        {
            var addresses = [];

            init();

            return {
                getAddresses  : getAddresses,
                getList       : getList,
                filter        : filter,
                houseNoAllowed: houseNoAllowed
            };

            function init()
            {
                API.get( '/rest/checkout/addresssuggestionresultslist/', {
                    suggestionType: "addressdoctor",
                    street        : addressInput.Street,
                    ZIP           : addressInput.ZIP,
                    city          : addressInput.City,
                    houseNo       : addressInput.HouseNo,
                    country       : addressInput.CountryID
                }, false, false, true ).done( function( response )
                {

                    var responseLength = response.data.length;

                    for ( var i = 0; i < responseLength; i++ )
                    {
                        var currentResponse = response.data[i];

                        var address = getAddress( currentResponse )
                        if ( !address )
                        {
                            currentResponse.HouseNo = [currentResponse.HouseNo];
                            addresses.push( currentResponse );
                        }
                        else
                        {
                            address.HouseNo.push( currentResponse.HouseNo );
                        }

                    }

                } );
            }

            function getAddress( suggestion )
            {
                var addressCount = addresses.length;

                for ( var j = 0; j < addressCount; j++ )
                {
                    if ( suggestion.Street == addresses[j].Street && addresses.ZIP == addresses[j].ZIP && suggestion.City == addresses[j].City )
                    {
                        return addresses[j];
                    }
                }

                return null;

            }

            function getAddresses()
            {
                return addresses;
            }

            function getList( key )
            {
                var results      = [];
                var addressCount = addresses.length;

                for ( var i = 0; i < addressCount; i++ )
                {
                    var address = addresses[i];
                    if ( $.inArray( address[key], results ) < 0 )
                    {
                        results.push( address[key] );
                    }
                }

                return results;
            }

            function filter( filterAddress )
            {
                var filteredAddresses = [];
                var addressCount      = addresses.length;

                for ( var i = 0; i < addressCount; i++ )
                {
                    var address = addresses[i];
                    if ( (!!filterAddress.Street && filterAddress.Street == address.Street)
                        || (!!filterAddress.ZIP && filterAddress.ZIP == address.ZIP)
                        || (!!filterAddress.City && filterAddress.City == address.City) )
                    {
                        filteredAddresses.push( address );
                    }
                }

                addresses = filteredAddresses;
            }

            function houseNoAllowed( houseNo )
            {
                houseNo = parseInt( houseNo );

                var addressCount = addresses.length;

                for ( var i = 0; i < addressCount; i++ )
                {
                    var address = addresses[i];

                    for ( var j = 0; j < address.HouseNo.length; j++ )
                    {
                        var range = address.HouseNo[j].split( '-' );
                        if ( ( range.length == 1 && houseNo == range[0] )
                            || range.length == 2 && houseNo >= range[0] && houseNo <= range[1] )
                        {
                            return true;
                        }
                    }
                }

                return false;
            }
        }

    }, ['APIFactory'] );
}( jQuery, PlentyFramework ));