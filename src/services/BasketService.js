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
     * Providing methods for adding, editing or removing basket items and coupon codes<br>
     * <b>Requires:</b>
     * <ul>
     *     <li>{{#crossLink "APIFactory"}}APIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "UIFactory"}}UIFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CMSFactory"}}CMSFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "CheckoutFactory"}}CheckoutFactory{{/crossLink}}</li>
     *     <li>{{#crossLink "ModalFactory"}}ModalFactory{{/crossLink}}</li>
     * </ul>
     * @class BasketService
     * @static
     */
    pm.service( 'BasketService', function( API, UI, CMS, Checkout, Modal )
    {

        Checkout.watch('Checkout.BasketItemsList', function() {

            if ( !Checkout.getBasketItemsList() || Checkout.getBasketItemsList().length <= 0 )
            {
                CMS.reloadCatContent( pm.getGlobal( 'basketCatID' ) );
            }
            else
            {
                CMS.reloadContainer( 'Totals' );
            }

            refreshBasketPreview();
        });

        Checkout.watch('Checkout.Coupon', function() {
            CMS.reloadContainer( 'Coupon' );
            CMS.reloadContainer( 'Totals' );
        });

        return {
            addItem           : addBasketItem,
            removeItem        : removeBasketItem,
            /** @deprecated **/
            getItem           : getItem,
            setItemQuantity   : setItemQuantity,
            editItemAttributes: editItemAttributes,
            editOrderParams   : editOrderParams,
            addCoupon         : addCoupon,
            removeCoupon      : removeCoupon
        };

        /**
         * Add item to basket. Will fail and show a popup if item has order params
         * @function addBasketItem
         * @param   {Array}     basketItemList         Array containing the item to add
         * @param   {boolean}   [isUpdate=false]      Indicating if item's OrderParams are updated
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function addBasketItem( basketItemList )
        {

            if ( !!basketItemList )
            {
                CMS.getContainer( 'CheckoutOrderParamsList', {
                    itemID  : basketItemList[0].BasketItemItemID,
                    quantity: basketItemList[0].BasketItemQuantity
                }).from( 'Checkout' ).done( function( response )
                    {
                        // checking for order params!
                        if ( response.data[0].indexOf( "form-group" ) > 0 )
                        {
                            Modal.prepare()
                                .setContent( response.data[0] )
                                .setTitle( pm.translate( "Select order parameters" ) )
                                .setLabelConfirm( pm.translate( "Save" ) )
                                .onConfirm( function()
                                {
                                    // validate form
                                    if ( $('[data-plenty-checkout-form="OrderParamsForm"]').validateForm() )
                                    {
                                        // save order params
                                        handleRequest( saveOrderParams( basketItemList ) );

                                        // close modal after saving order params
                                        return true;
                                    }
                                    else
                                    {
                                        return false;
                                    }
                                } )
                                .show();
                        }
                        else
                        {
                            handleRequest( basketItemList );
                        }
                    } );
            }

            function handleRequest( basketItemList )
            {
                Checkout.setBasketItemsList( basketItemList )
                    .done( function()
                    {
                        // Show confirmation popup
                        CMS.getContainer( 'ItemViewItemToBasketConfirmationOverlay', {ArticleID: basketItemList[0].BasketItemItemID} )
                            .from( 'ItemView' )
                            .done( function( response )
                            {
                                Modal.prepare()
                                    .setContent( response.data[0] )
                                    .setTimeout( 5000 )
                                    .show();
                            } );
                    } );
            }
        }

        /**
         * Read OrderParams from &lt;form> marked with <b>data-plenty-checkout-form="OrderParamsForm"</b> and inject
         * read values in 'addBasketList'. Update item by calling <code>addBasketItem()</code> again
         * @function saveOrderParams
         * @private
         * @param {Array} itemWithParams Containing the current item to add. Read OrderParams will be injected
         */
        function saveOrderParams( itemWithParams )
        {
            //TODO use $("[data-plenty-checkout-form='OrderParamsForm']").serializeArray() to get order params
            var orderParamsForm = $( '[data-plenty-checkout-form="OrderParamsForm"]' );
            var $self           = {};
            var attrType        = "";
            var match;

            //Groups
            orderParamsForm.find( '[name^="ParamGroup"]' ).each( function()
            {
                match             = this.name.match( /^ParamGroup\[(\d+)]\[(\d+)]$/ );
                itemWithParams = addOrderParamValue( itemWithParams, match[1], $( this ).val(), $( this ).val() );
            } );

            //Values
            orderParamsForm.find( '[name^="ParamValue"]' ).each( function()
            {
                $self    = $( this );
                attrType = $self.attr( 'type' );

                if ( ((attrType == 'checkbox' && $self.is( ':checked' )) ||
                    (attrType == 'radio' && $self.is( ':checked' )) ||
                    (attrType != 'radio' && attrType != 'checkbox')) && attrType != 'file' && attrType != 'hidden' )
                {

                    var match = $self[0].name.match( /^ParamValue\[(\d+)]\[(\d+)]$/ );
                    itemWithParams = addOrderParamValue( itemWithParams, match[1], match[2], $self.val() );

                }
                else if ( attrType == 'file' )
                {
                    if( $self[0].files && $self[0].files.length > 0 )
                    {
                        itemWithParams = orderParamFileUpload( $self, itemWithParams );
                    }
                    else
                    {
                        var match = $self[0].name.match( /^ParamValueFile\[(\d+)]\[(\d+)]$/ );
                        var paramValue = $( 'input[type="hidden"][name="ParamValue[' + match[1] + '][' + match[2] + ']"]' ).val();
                        itemWithParams = addOrderParamValue( itemWithParams, match[1], match[2], paramValue );
                    }
                }
            } );

            return itemWithParams;
        }

        function updateBasketItem( basketItem )
        {
            Checkout.updateBasketItemsList( basketItem );
            /*
                .done( function()
                {
                    // Item has no OrderParams -> Refresh Checkout & BasketPreview
                    CMS.reloadCatContent( pm.getGlobal( 'basketCatID' ) );
                } );
                */
        }

        function orderParamFileUpload( $input, articleWithParams )
        {
            var key                   = $input[0].id;
            var orderParamUploadFiles = {};
            var orderParamFileIdStack = [];
            var formData;
            var fileData;
            var params                = {
                type       : 'POST',
                data       : {},
                isFile     : true,
                cache      : false,
                dataType   : 'json',
                processData: false,
                contentType: false
            };

            orderParamUploadFiles[key] = $input[0].files;

            // if input not pushed before.
            if ( orderParamFileIdStack.indexOf( key ) == -1 )
            {
                orderParamFileIdStack.push( key );
            }

            for ( var i = 0, length = orderParamFileIdStack.length; i < length; ++i )
            {
                formData = new FormData();
                fileData = orderParamUploadFiles[orderParamFileIdStack[i]];
                formData.append( "0", fileData[0], fileData[0].name );

                params.data = formData;

                API.post( "/rest/checkout/orderparamfile/", params );
            }

            var match = $input[0].name.match( /^ParamValueFile\[(\d+)]\[(\d+)]$/ );

            return addOrderParamValue( articleWithParams, match[1], match[2], $input.val() );
        }

        /**
         * Inject an OrderParam.
         * @function addOrderParamValue
         * @private
         * @param {Array} basketList The target to inject the value in.
         * @param {number} position Position where to inject the value
         * @param {number} paramId The ID of the OrderParam to inject
         * @param {string|number} paramValue the value of the OrderParam to inject
         * @returns {Array} Containing the item and the injected OrderParam
         */
        function addOrderParamValue( basketList, position, paramId, paramValue )
        {
            if ( position > 0 && basketList[position] == undefined )
            {
                basketList[position]                           = $.extend( true, {}, basketList[0] );
                basketList[position].BasketItemOrderParamsList = [];
            }

            if ( basketList[position] != undefined )
            {
                basketList[position].BasketItemQuantity = 1;
                if ( basketList[position].BasketItemOrderParamsList == undefined )
                {
                    basketList[position].BasketItemOrderParamsList = [];
                }
                if ( paramValue )
                {
                    basketList[position].BasketItemOrderParamsList.push( {
                        BasketItemOrderParamID   : paramId,
                        BasketItemOrderParamValue: paramValue
                    } );
                }
            }

            return basketList;
        }

        function editItemAttributes( BasketItemID )
        {
            var modal = $( '[data-plenty-basket-item="' + BasketItemID + '"' );
            modal.modal( 'show' );
            modal.find( '[data-plenty-modal="confirm"]' ).on( 'click', function()
            {
                var basketItem     = getBasketItem( BasketItemID );
                var attributesList = [];

                // check for select or list of images
                modal.find( 'select, .PlentyFormContainer.AttrImage > input[type="hidden"]' ).each( function( i, attributeSelect )
                {
                    var match = attributeSelect.name.match( /^ArticleAttribute\[\d+]\[\d+]\[(\d+)]$/ );
                    if ( match && match[1] )
                    {
                        attributesList.push( {
                            BasketItemAttributeID     : match[1],
                            BasketItemAttributeValueID: $( attributeSelect ).val()
                        } );
                    }

                } );

                if ( attributesList.length != 0 )
                {
                    basketItem.BasketItemAttributesList = attributesList;
                }
                //update basketItem and refresh previewLists
                updateBasketItem( [basketItem] );

            } );
        }

        function editOrderParams( BasketItemID )
        {

            var basketItem = Checkout.getBasketItem( BasketItemID );

            // FIX: unset old order params
            basketItem.BasketItemOrderParamsList = [];

            CMS.getContainer( 'CheckoutOrderParamsList', {
                itemID      : basketItem.BasketItemItemID,
                quantity    : basketItem.BasketItemQuantity,
                basketItemID: BasketItemID
            } )
                .from('Checkout')
                .done( function( resp )
                {
                    // checking for order params!
                    Modal.prepare()
                        .setContent( resp.data[0] )
                        .setTitle( pm.translate( "Edit order parameters" ) )
                        .setLabelConfirm( pm.translate( "Save" ) )
                        .onConfirm( function()
                        {
                            // validate form
                            if ( $('[data-plenty-checkout-form="OrderParamsForm"]').validateForm() )
                            {
                                // save order params
                                updateBasketItem( saveOrderParams( [basketItem] ) );

                                // close modal after saving order params
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

        /** @deprecated **/
        function getItem( BasketItemID )
        {
            return Checkout.getBasketItem( BasketItemID );
        }

        /**
         * Remove item from basket. Will show a confirmation popup at first.
         * @function removeBasketItem
         * @param {number}  BasketItemID The ID of the basket item to remove
         * @param {boolean} [forceDelete=false]  Set true to remove the basket item without showing a confirmation popup
         * @return Promise
         */
        function removeBasketItem( BasketItemID, forceDelete )
        {

            var deferred = $.Deferred();

            // get item name
            var itemName = Checkout.getBasketItem( BasketItemID ).BasketItemNameMap[1];

            // calling the delete request
            function doDelete()
            {
                Checkout.deleteBasketItem( BasketItemID )
                    .done( function()
                    {
                        $( '[data-basket-item-id="' + BasketItemID + '"]' ).remove();
                        deferred.resolve();
                    } );
            }

            if ( !forceDelete )
            {
                // show confirmation popup
                Modal.prepare()
                    .setTitle( pm.translate( 'Please confirm' ) )
                    .setContent( '<p>' + pm.translate( "Do you really want to remove \"{{item}}\" from your basket?", {item: itemName} ) + '</p>' )
                    .onDismiss( function()
                    {
                        //$('[data-basket-item-id="' + BasketItemID +
                        // '"]').find('[data-plenty="quantityInput"]').val(originalItemQuantity);
                        deferred.reject();
                    } )
                    .onConfirm( function()
                    {
                        doDelete();
                    } )
                    .setLabelConfirm( pm.translate( "Delete" ) )
                    .show();
            }
            else
            {
                doDelete();
            }

            return deferred;
        }

        /**
         * Set a new quantity for the given BasketItem. If quantity is set to 0,
         * remove the item.
         * @function setItemQuantity
         * @param {number} BasketItemID The ID of the basket item to change the quantity of
         * @param {number} BasketItemQuantity  The new quantity to set or 0 to remove the item
         */
        function setItemQuantity( BasketItemID, BasketItemQuantity )
        {
            // delete item if quantity is 0
            if ( BasketItemQuantity <= 0 )
            {
                return removeBasketItem( BasketItemID );
            }

            return Checkout.updateBasketItem({
                BasketItemID: BasketItemID,
                BasketItemQuantity: BasketItemQuantity
            });

        }

        /**
         * Reload BasketPreview-Template and update basket totals
         * @function refreshBasketPreview
         * @private
         */
        function refreshBasketPreview()
        {

            CMS.reloadItemContainer( 'BasketPreviewList' )
                .done( function()
                {

                    $( '[data-plenty-basket-empty]' ).each( function( i, elem )
                    {
                        var toggleClass = $( elem ).attr( 'data-plenty-basket-empty' );
                        if ( Checkout.getBasketItemsList().length <= 0 )
                        {
                            $( elem ).addClass( toggleClass );
                        }
                        else
                        {
                            $( elem ).removeClass( toggleClass );
                        }
                    } );

                } );

            //update quantity
            var itemQuantityTotal = 0;
            $.each( Checkout.getBasketItemsList(), function( i, basketItem )
            {
                itemQuantityTotal += basketItem.BasketItemQuantity;
            } );

            $( '[data-plenty-basket-preview="itemQuantityTotal"]' ).text( itemQuantityTotal );
            $( '[data-plenty-basket-preview="totalsItemSum"]' ).text( Checkout.getCheckout().Totals.TotalsItemSum );
        }

        /**
         * Read the coupon code from an &lt;input> element marked with <b>data-plenty-checkout-form="couponCode"</b>
         * and try to add this coupon.
         * @function addCoupon
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function addCoupon()
        {
            return Checkout.setCoupon( $( '[data-plenty-checkout-form="couponCode"]' ).val() );

            /*
            var params = {
                CouponActiveCouponCode: $( '[data-plenty-checkout-form="couponCode"]' ).val()
            };


            return API.post( "/rest/checkout/coupon/", params )
                .done( function()
                {
                    Checkout.setCheckout()
                        .done( function()
                        {

                            updateContainer();
                        } );
                } );
                */
        }

        /**
         * Remove the currently added coupon
         * @function removeCoupon
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function removeCoupon()
        {
            return Checkout.deleteCoupon();
        }


    }, ['APIFactory', 'UIFactory', 'CMSFactory', 'CheckoutFactory', 'ModalFactory'] );
}( jQuery, PlentyFramework ));