(function( $, pm )
{
    pm.directive( 'Basket', function( BasketService )
    {

        return {
            addBasketItem     : addBasketItem,
            changeItemQuantity: changeItemQuantity,
            setItemQuantity   : setItemQuantity
        };

        function addBasketItem( elem )
        {
            pm.getRecentEvent().preventDefault();
            //init
            var basketItemsList = {};
            var $elem           = $( elem );
            var parentForm      = $elem.parents( 'form' );

            basketItemsList.BasketItemItemID   = parentForm.find( '[name="ArticleID"]' ).val();
            basketItemsList.BasketItemPriceID  = parentForm.find( '[name="SYS_P_ID"]' ).val();
            basketItemsList.BasketItemQuantity = parentForm.find( '[name="ArticleQuantity"]' ).val();
            basketItemsList.BasketItemBranchID = parentForm.find( '[name="source_category"]' ).val();

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

            //add basketItem and refresh previewLists
            BasketService.addItem( [basketItemsList] );

        }

        function changeItemQuantity( elem, increment )
        {
            var $elem         = $( elem );
            var $quantityInput = $elem.parent().find( 'input' );
            var maxLength     = parseInt( $quantityInput.attr( 'maxlength' ) ) || 5;
            var value         = parseInt( $quantityInput.val() ) + increment;

            var isBasketView = $elem.parents( '[data-basket-item-id]' ).length > 0;

            if ( isBasketView )
            {
                if ( (value + '').length <= maxLength && value >= 0 )
                {
                    $quantityInput.val( value );
                }

                var timeout = $elem.data( 'timeout' );

                if ( !!timeout )
                {
                    window.clearTimeout( timeout );
                }

                timeout = window.setTimeout( function()
                {
                    $quantityInput.trigger( 'change' );
                }, 1000 );

                $elem.data( 'timeout', timeout );
            }
            else {
                if ( (value + '').length <= maxLength && value >= 1 )
                {
                    $quantityInput.val( value );
                }
            }
        }

        function setItemQuantity( basketItemID, input )
        {
            BasketService.setItemQuantity(
                basketItemID,
                parseInt( $( input ).val() )
            ).fail( function()
            {
                // reset input's value on cancel
                var basketItem = BasketService.getItem( basketItemID );
                $( input ).val( basketItem.BasketItemQuantity );
            } );
        }

    }, ['BasketService'] );
}( jQuery, PlentyFramework ));