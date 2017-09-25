(function( $, pm )
{
    pm.directive( 'Basket', function( BasketService )
    {

        return {
            addBasketItem     : addBasketItem,
            changeItemQuantity: changeItemQuantity,
            setItemQuantity   : setItemQuantity,
            updateItemQuantity : updateItemQuantity
        };

        function addBasketItem( elem )
        {
            pm.getRecentEvent().preventDefault();
            //init
            var basketItemsList = {};
            var scheduler       = {};
            var $elem           = $( elem );
            var parentForm      = $elem.parents( 'form' );
            var $p_id           = parentForm.find( '[name="P_ID"]:checked' );

            scheduler.SchedulerInterval = parentForm.find( '[name="scheduler_interval"]' ).val();
            scheduler.SchedulerRepeating = parentForm.find( '[name="scheduler_repeating"]' ).val();
            scheduler.SchedulerDate = parentForm.find( '[name="scheduler_dateselector"]' ).val();

            basketItemsList.BasketItemItemID   = parentForm.find( '[name="ArticleID"]' ).val();
            basketItemsList.BasketItemPriceID  = parentForm.find( '[name="SYS_P_ID"]' ).val();
            basketItemsList.BasketItemQuantity = parentForm.find( '[name^="ArticleQuantity"]' ).val();
            basketItemsList.BasketItemBranchID = parentForm.find( '[name="source_category"]' ).val();

            // look for occurrences of unit combination and take price id of combination, if available.
            if ( $p_id.length > 0
                && $p_id.val() > 0 )
            {
                basketItemsList.BasketItemPriceID = $p_id.val();
            }

            //attributes
            var attributeInputsList = parentForm.find( '[name^="ArticleAttribute"]' );
            var attributesList      = [];

            $.each( attributeInputsList, function( idx, elem )
            {
                var match = elem.name.match( /^ArticleAttribute\[\d+]\[\d+]\[(\d+)]$/ );
                if ( match && match[1] )
                {
                    attributesList.push( {
                        BasketItemAttributeID     : match[1],
                        BasketItemAttributeValueID: $( elem ).val()
                    } );
                }
            } );

            if ( attributesList.length != 0 )
            {
                basketItemsList.BasketItemAttributesList = attributesList;
            }

            if(typeof scheduler.SchedulerInterval !== "undefined"
                && scheduler.SchedulerInterval > 0)
            {
                BasketService.setScheduler( scheduler );
            }

            //add basketItem and refresh previewLists
            BasketService.addItem( [basketItemsList] );

        }

        function changeItemQuantity( elem, increment )
        {
            var $elem          = $( elem );
            var $quantityInput = $elem.parent().find( 'input' );
            var maxLength      = parseInt( $quantityInput.attr( 'maxlength' ) ) || 5;
            var value          = convertToFloat( $quantityInput.val() ) + increment;

            setItemQuantityToNewValue( $elem, $quantityInput, maxLength, value)
        }

        function updateItemQuantity( elem )
        {
            var $elem = $( elem );
            var $quantityInput = $elem;
            var maxLength      = parseInt( $quantityInput.attr( 'maxlength' ) ) || 5;
            var value          = convertToFloat( $quantityInput.val() );

            setItemQuantityToNewValue($elem, $quantityInput, maxLength, value);
        }

        function setItemQuantity( basketItemID, input )
        {
            BasketService.setItemQuantity(
                basketItemID,
                convertToFloat( $( input ).val() )
            ).fail( function()
            {
                // reset input's value on cancel
                var basketItem = BasketService.getItem( basketItemID );
                $( input ).val( basketItem.BasketItemQuantity );
            } );
        }

        function setItemQuantityToNewValue(element, quantityInput, maxLength, value)
        {
            var isBasketView = element.parents( '[data-basket-item-id]' ).length > 0;

            if ( isBasketView )
            {
                if ( (value + '').length <= maxLength && value >= 0 )
                {
                    quantityInput.val( value );
                }

                var timeout = element.data( 'timeout' );

                if ( !!timeout )
                {
                    window.clearTimeout( timeout );
                }

                timeout = window.setTimeout( function()
                {
                    quantityInput.trigger( 'change' );
                }, 1000 );

                element.data( 'timeout', timeout );
            }
            else
            {
                if ( (value + '').length <= maxLength && value >= 1 )
                {
                    quantityInput.val( value );
                    element.parents( 'form' ).find( '[name^="ArticleQuantity"]' ).val( value );
                }
            }
        }


        function convertToFloat(n) {
            n = n.replace(',', '.');
            if(!isNaN(parseFloat(n)) && isFinite(n))
            {
              return parseFloat(n);
            }
            return 1;
        }

    }, ['BasketService'] );
}( jQuery, PlentyFramework ));
