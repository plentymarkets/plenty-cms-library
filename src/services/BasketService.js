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
(function($, pm) {

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
	pm.service('BasketService', function( API, UI, CMS, Checkout, Modal ) {

		return {
			addItem: addBasketItem,
            removeItem: removeBasketItem,
            setItemQuantity: setItemQuantity,
            addCoupon: addCoupon,
            removeCoupon: removeCoupon
		};

        /**
         * Add item to basket. Will fail and show a popup if item has order params
         * @function addBasketItem
         * @param   {Array}     article         Array containing the item to add
         * @param   {boolean}   [isUpdate=false]      Indicating if item's OrderParams are updated
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function addBasketItem( article ) {

            if( !!article ) {

                API.get( '/rest/checkout/container_' + 'CheckoutOrderParamsList'.toLowerCase() + '/',
                    {   itemID : article[0].BasketItemItemID,
                        quantity : article[0].BasketItemQuantity }).done(function (resp) {
                            // checking for order params!
                            if (resp.data[0].indexOf("form-group") > 0) {
                                Modal.prepare()
                                    .setContent(resp.data[0])
                                    .onConfirm(function() {
                                        // save order params
                                        saveOrderParams(article);

                                        // close modal after saving order params
                                        return true;
                                    })
                                    .show();
                            } else {
                                addArticle(article);
                            }
                    });
            }
        }

        /**
         * Read OrderParams from &lt;form> marked with <b>data-plenty-checkout-form="OrderParamsForm"</b> and inject
         * read values in 'addBasketList'. Update item by calling <code>addBasketItem()</code> again
         * @function saveOrderParams
         * @private
         * @param {Array} articleWithParams Containing the current item to add. Read OrderParams will be injected
         */
        function saveOrderParams( articleWithParams ) {
            var orderParamsForm = $('[data-plenty-checkout-form="OrderParamsForm"]');

            //TODO use $("[data-plenty-checkout-form='OrderParamsForm']").serializeArray() to get order params
            //Groups
            orderParamsForm.find('[name^="ParamGroup"]').each(function(){
                var match = this.name.match(/^ParamGroup\[(\d+)]\[(\d+)]$/);
                articleWithParams = addOrderParamValue(articleWithParams, match[1], $(this).val(), $(this).val());
            });

            //Values
            orderParamsForm.find('[name^="ParamValue"]').each(function(){

                if( ($(this).attr('type') == 'checkbox' && $(this).is(':checked')) ||
                    ($(this).attr('type') == 'radio' && $(this).is(':checked')) ||
                    ($(this).attr('type') != 'radio' && $(this).attr('type') != 'checkbox') )
                {
                    var match = this.name.match(/^ParamValue\[(\d+)]\[(\d+)]$/);
                    articleWithParams = addOrderParamValue(articleWithParams, match[1], match[2], $(this).val());
                }
            });

            addArticle( articleWithParams );
        }

        function addArticle( article ) {
            API.post( '/rest/checkout/basketitemslist/', article, true)
                .done(function() {
                    // Item has no OrderParams -> Refresh Checkout & BasketPreview
                    Checkout.loadCheckout()
                        .done(function() {
                            refreshBasketPreview();
                            // Show confirmation popup
                            CMS.getContainer('ItemViewItemToBasketConfirmationOverlay', { ArticleID : article[0].BasketItemItemID }).from('ItemView')
                                .done(function(response) {
                                    Modal.prepare()
                                        .setContent(response.data[0])
                                        .setTimeout(5000)
                                        .show();
                                });
                        });
                }).fail(function(jqXHR) {
                    // some other error occured
                    UI.printErrors(JSON.parse(jqXHR.responseText).error.error_stack);
                });
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
        function addOrderParamValue(basketList, position, paramId, paramValue) {
            if (position > 0 && basketList[position] == undefined)
            {
                basketList[position] = $.extend(true, {}, basketList[0]);
                basketList[position].BasketItemOrderParamsList = [];
            }

            if(basketList[position] != undefined)
            {
                basketList[position].BasketItemQuantity = 1;
                if(basketList[position].BasketItemOrderParamsList == undefined)
                {
                    basketList[position].BasketItemOrderParamsList = [];
                }

                basketList[position].BasketItemOrderParamsList.push({
                    BasketItemOrderParamID : paramId,
                    BasketItemOrderParamValue : paramValue
                });
            }

            return basketList;
        }

        /**
         * Remove item from basket. Will show a confirmation popup at first.
         * @function removeBasketItem
         * @param {number}  BasketItemID The ID of the basket item to remove
         * @param {boolean} [forceDelete=false]  Set true to remove the basket item without showing a confirmation popup
         * @return Promise
         */
        function removeBasketItem( BasketItemID, forceDelete ) {

            // get item name
            var itemName, originalItemQuantity;
            var params = Checkout.getCheckout().BasketItemsList;
            for ( var i = 0; i < params.length; i++ ) {
                if ( params[i].BasketItemID == BasketItemID ) {
                    originalItemQuantity = params[i].BasketItemQuantity;
                    itemName = params[i].BasketItemNameMap[1];
                }
            }

            // calling the delete request
            function doDelete() {
                API.delete('/rest/checkout/basketitemslist/?basketItemIdsList[0]='+BasketItemID)
                    .done(function() {
                        Checkout.loadCheckout().done(function() {
                            $('[data-basket-item-id="'+BasketItemID+'"]').remove();

                            if( !Checkout.getCheckout().BasketItemsList || Checkout.getCheckout().BasketItemsList.length <= 0 ) {
                                Checkout.reloadCatContent( pm.getGlobal( 'basketCatID' ) );
                            } else {
                                Checkout.reloadContainer('Totals');
                            }

                            refreshBasketPreview();
                        });
                    });
            }

            if( !forceDelete ) {
                // show confirmation popup
                Modal.prepare()
                    .setTitle( pm.translate('Please confirm') )
                    .setContent('<p>' + pm.translate( "Do you really want to remove \"{{item}}\" from your basket?", {item: itemName}) + '</p>')
                    .onDismiss(function () {
                        $('[data-basket-item-id="' + BasketItemID + '"]').find('[data-plenty="quantityInput"]').val(originalItemQuantity);
                    })
                    .onConfirm(function () {
                        doDelete();
                    })
                    .setLabelConfirm( pm.translate("Delete") )
                    .show();
            } else {
                doDelete();
            }
        }

        /**
         * Set a new quantity for the given BasketItem. If quantity is set to 0,
         * remove the item.
         * @function setItemQuantity
         * @param {number} BasketItemID The ID of the basket item to change the quantity of
         * @param {number} BasketItemQuantity  The new quantity to set or 0 to remove the item
         */
        function setItemQuantity( BasketItemID, BasketItemQuantity ) {
            // delete item if quantity is 0
            if( BasketItemQuantity <= 0 ) {
                removeBasketItem( BasketItemID );
            }

            var params = Checkout.getCheckout().BasketItemsList;
            var basketItem;
            var basketItemIndex;
            for ( var i = 0; i < params.length; i++ ) {
                if ( params[i].BasketItemID == BasketItemID ) {
                    basketItemIndex = i;
                    basketItem = params[i];
                    break;

                }
            }

            if( !!basketItem && basketItem.BasketItemQuantity != BasketItemQuantity ) {
                params[basketItemIndex].BasketItemQuantity = parseInt( BasketItemQuantity );

                API.post("/rest/checkout/basketitemslist/", params)
                    .done(function () {
                        Checkout.setCheckout().done(function () {
                            Checkout.reloadContainer('Totals');

                            var basketItemsPriceTotal = 0;
                            var params2 = Checkout.getCheckout().BasketItemsList;
                            for (var i = 0; i < params2.length; i++) {
                                if (params2[i].BasketItemID == BasketItemID) {
                                    basketItemsPriceTotal = params2[i].BasketItemPriceTotal;
                                }
                            }
                            $('[data-basket-item-id="' + BasketItemID + '"]').find('[data-plenty-checkout="basket-item-price-total"]').html(basketItemsPriceTotal);
                            refreshBasketPreview();
                        });
                    });
            }
        }

        /**
         * Reload BasketPreview-Template and update basket totals
         * @function refreshBasketPreview
         * @private
         */
        function refreshBasketPreview() {

            Checkout.reloadItemContainer('BasketPreviewList')
                .done(function() {

                    $('[data-plenty-basket-empty]').each(function(i, elem) {
                        var toggleClass = $(elem).attr('data-plenty-basket-empty');
                        if( Checkout.getCheckout().BasketItemsList.length <= 0 ) {
                            $(elem).addClass( toggleClass );
                        } else {
                            $(elem).removeClass( toggleClass );
                        }
                    });

                });

            //update quantity
            var itemQuantityTotal = 0;
            $.each( Checkout.getCheckout().BasketItemsList, function(i, basketItem) {
                itemQuantityTotal += basketItem.BasketItemQuantity;
            });

            $('[data-plenty-basket-preview="itemQuantityTotal"]').text( itemQuantityTotal );
            $('[data-plenty-basket-preview="totalsItemSum"]').text( Checkout.getCheckout().Totals.TotalsItemSum );
        }

        /**
         * Read the coupon code from an &lt;input> element marked with <b>data-plenty-checkout-form="couponCode"</b>
         * and try to add this coupon.
         * @function addCoupon
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function addCoupon() {
            var params = {
                CouponActiveCouponCode: $('[data-plenty-checkout-form="couponCode"]').val()
            };

            return API.post("/rest/checkout/coupon/", params)
                .done(function() {
                    Checkout.setCheckout()
                        .done(function() {

                            updateContainer();
                        });
                });
        }

        /**
         * Remove the currently added coupon
         * @function removeCoupon
         * @return {object} <a href="http://api.jquery.com/category/deferred-object/" target="_blank">jQuery deferred
         *     Object</a>
         */
        function removeCoupon() {
            var params = {
                CouponActiveCouponCode: Checkout.getCheckout().Coupon.CouponActiveCouponCode
            };

            return API.delete("/rest/checkout/coupon/", params)
                .done(function() {
                    Checkout.setCheckout()
                        .done(function() {
                            delete Checkout.getCheckout().Coupon;

                            updateContainer();
                        });
                });
        }

        // update container
        function updateContainer() {
            Checkout.reloadContainer('Coupon');
            // reload category, if we are at checkout
            if ( $('[data-plenty-checkout-catcontent="' + pm.getGlobal('checkoutConfirmCatID') + '"]').length > 0 ) {
                Checkout.reloadCatContent( pm.getGlobal('checkoutConfirmCatID') );
            }
            else
                // reload totals, if we are at basket
                if ( $('[data-plenty-checkout-template="Totals"]').length > 0 ) {
                Checkout.reloadContainer('Totals');
            }
        }

	}, ['APIFactory', 'UIFactory', 'CMSFactory', 'CheckoutFactory', 'ModalFactory']);
}(jQuery, PlentyFramework));