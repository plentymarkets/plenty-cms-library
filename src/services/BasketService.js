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

        return {
            addItem           : addBasketItem,
            removeItem        : removeBasketItem,
            getItem           : getBasketItem,
            setItemQuantity   : setItemQuantity,
            editItemAttributes: editItemAttributes,
            editOrderParams   : editOrderParams,
            addCoupon         : addCoupon,
            removeCoupon      : removeCoupon
        };

        /**
         * Add item to basket. Will fail and show a popup if item has order params
         * @function addBasketItem
         * @param   {Array}     article         Array containing the item to add
         * @param   {boolean}   [isUpdate=false]      Indicating if item's OrderParams are updated
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function addBasketItem( article )
        {

            if ( !!article )
            {

                API.get( '/rest/checkout/container_' + 'CheckoutOrderParamsList'.toLowerCase() + '/',
                    {
                        itemID  : article[0].BasketItemItemID,
                        quantity: article[0].BasketItemQuantity
                    }, false, true ).done( function( resp )
                {
                    // checking for order params!
                    if ( resp.data[0].indexOf( "form-group" ) > 0 )
                    {
                        Modal.prepare()
                            .setContent( resp.data[0] )
                            .setTitle( pm.translate( "Select order parameters" ) )
                            .setLabelConfirm( pm.translate( "Save" ) )
                            .onConfirm( function()
                            {
                                // validate form
                                if ( $( '[data-plenty-checkout-form="OrderParamsForm"]' ).validateForm() )
                                {
                                    // save order params
                                    addArticle( saveOrderParams( article ) );

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
                        addArticle( article );
                    }
                } );
            }
        }

        /**
         * Read OrderParams from &lt;form> marked with <b>data-plenty-checkout-form="OrderParamsForm"</b> and inject
         * read values in 'addBasketList'. Update item by calling <code>addBasketItem()</code> again
         * @function saveOrderParams
         * @private
         * @param {Array} articleWithParams Containing the current item to add. Read OrderParams will be injected
         */
        function saveOrderParams( articleWithParams )
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
                articleWithParams = addOrderParamValue( articleWithParams, match[1], $( this ).val(), $( this ).val() );
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

                    var match         = $self[0].name.match( /^ParamValue\[(\d+)]\[(\d+)]$/ );
                    articleWithParams = addOrderParamValue( articleWithParams, match[1], match[2], $self.val() );

                }
                else if ( attrType == 'file' )
                {
                    if ( $self[0].files && $self[0].files.length > 0 )
                    {
                        articleWithParams = orderParamFileUpload( $self, articleWithParams );
                    }
                    else
                    {
                        var match         = $self[0].name.match( /^ParamValueFile\[(\d+)]\[(\d+)]$/ );
                        var paramValue    = $( 'input[type="hidden"][name="ParamValue[' + match[1] + '][' + match[2] + ']"]' ).val();
                        articleWithParams = addOrderParamValue( articleWithParams, match[1], match[2], paramValue );
                    }
                }
            } );

            return articleWithParams;
        }

        function addArticle( article )
        {
            API.post( '/rest/checkout/basketitemslist/', article, true )
                .done( function()
                {
                    // Item has no OrderParams -> Refresh Checkout & BasketPreview
                    Checkout.loadCheckout()
                        .done( function()
                        {
                            refreshBasketPreview();
                            // Show confirmation popup
                            CMS.getContainer( 'ItemViewItemToBasketConfirmationOverlay', {ArticleID: article[0].BasketItemItemID} ).from( 'ItemView' )
                                .done( function( response )
                                {
                                    Modal.prepare()
                                        .setContent( response.data[0] )
                                        .setTimeout( 5000 )
                                        .show();
                                } );
                        } );
                } ).fail( function( jqXHR )
            {
                // some other error occured
                UI.printErrors( JSON.parse( jqXHR.responseText ).error.error_stack );
            } );
        }

        function updateArticle( article )
        {
            API.put( '/rest/checkout/basketitemslist/', article )
                .done( function()
                {
                    // Item has no OrderParams -> Refresh Checkout & BasketPreview
                    Checkout.reloadCatContent( pm.getGlobal( 'basketCatID' ) );
                    Checkout.loadCheckout()
                        .done( function()
                        {
                            refreshBasketPreview();
                        } );
                } )
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

            return addOrderParamValue( articleWithParams, match[1], match[2], orderParamUploadFiles[key][0]['name'] );
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
            var modal = $( '[data-plenty-basket-item="' + BasketItemID + '"]' );
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
                updateArticle( [basketItem] );

            } );
        }

        function editOrderParams( BasketItemID )
        {

            var basketItem = getBasketItem( BasketItemID );
            // FIX: unset old order params

            basketItem.BasketItemOrderParamsList = [];

            API.get( '/rest/checkout/container_' + 'CheckoutOrderParamsList'.toLowerCase() + '/', {
                itemID      : basketItem.BasketItemItemID,
                quantity    : basketItem.BasketItemQuantity,
                basketItemID: BasketItemID
            } ).done( function( resp )
            {
                // checking for order params!
                Modal.prepare()
                    .setContent( resp.data[0] )
                    .setTitle( pm.translate( "Edit order parameters" ) )
                    .setLabelConfirm( pm.translate( "Save" ) )
                    .onConfirm( function()
                    {
                        // validate form
                        if ( $( '[data-plenty-checkout-form="OrderParamsForm"]' ).validateForm() )
                        {
                            // save order params
                            updateArticle( saveOrderParams( [basketItem] ) );

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

        function getBasketItem( BasketItemID )
        {
            var basketItems = Checkout.getCheckout().BasketItemsList;
            for ( var i = 0; i < basketItems.length; i++ )
            {
                if ( basketItems[i].BasketItemID == BasketItemID )
                {
                    return basketItems[i];
                }
            }

            return null;
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
            var itemName = getBasketItem( BasketItemID ).BasketItemNameMap[1];

            // calling the delete request
            function doDelete()
            {
                API.delete( '/rest/checkout/basketitemslist/?basketItemIdsList[0]=' + BasketItemID )
                    .done( function()
                    {
                        Checkout.loadCheckout().done( function()
                        {
                            $( '[data-basket-item-id="' + BasketItemID + '"]' ).remove();

                            if ( !Checkout.getCheckout().BasketItemsList || Checkout.getCheckout().BasketItemsList.length <= 0 )
                            {
                                Checkout.reloadCatContent( pm.getGlobal( 'basketCatID' ) );
                            }
                            else
                            {
                                Checkout.reloadContainer( 'Totals' );
                            }

                            refreshBasketPreview();

                            deferred.resolve();
                        } );
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

            var deferred = $.Deferred();
            var params   = Checkout.getCheckout().BasketItemsList;
            var basketItem;
            var basketItemIndex;

            for ( var i = 0; i < params.length; i++ )
            {
                if ( params[i].BasketItemID == BasketItemID )
                {
                    basketItemIndex = i;
                    basketItem      = params[i];
                    break;

                }
            }

            if ( !!basketItem && basketItem.BasketItemQuantity != BasketItemQuantity )
            {
                params[basketItemIndex].BasketItemQuantity = parseInt( BasketItemQuantity );

                API.post( "/rest/checkout/basketitemslist/", params )
                    .done( function()
                    {
                        Checkout.setCheckout().done( function()
                        {
                            Checkout.reloadCatContent( pm.getGlobal( 'basketCatID' ) );
                            refreshBasketPreview();
                            deferred.resolve();
                        } );
                    } );
            }

            return deferred;
        }

        /**
         * Reload BasketPreview-Template and update basket totals
         * @function refreshBasketPreview
         * @private
         */
        function refreshBasketPreview()
        {

            Checkout.reloadItemContainer( 'BasketPreviewList' )
                .done( function()
                {

                    $( '[data-plenty-basket-empty]' ).each( function( i, elem )
                    {
                        var toggleClass = $( elem ).attr( 'data-plenty-basket-empty' );
                        if ( Checkout.getCheckout().BasketItemsList.length <= 0 )
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
            $.each( Checkout.getCheckout().BasketItemsList, function( i, basketItem )
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
        }

        /**
         * Remove the currently added coupon
         * @function removeCoupon
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function removeCoupon()
        {
            var params = {
                CouponActiveCouponCode: Checkout.getCheckout().Coupon.CouponActiveCouponCode
            };

            return API.delete( "/rest/checkout/coupon/", params )
                .done( function()
                {
                    Checkout.setCheckout()
                        .done( function()
                        {
                            delete Checkout.getCheckout().Coupon;

                            updateContainer();
                        } );
                } );
        }

        // update container
        function updateContainer()
        {
            Checkout.reloadContainer( 'Coupon' );
            // reload totals, if we are at basket
            if ( $( '[data-plenty-checkout-template="Totals"]' ).length > 0 )
            {
                Checkout.reloadContainer( 'Totals' );
            }
        }

    }, ['APIFactory', 'UIFactory', 'CMSFactory', 'CheckoutFactory', 'ModalFactory'] );
}( jQuery, PlentyFramework ));
