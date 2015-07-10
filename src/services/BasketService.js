(function(pm) {

	pm.service('BasketService', function( API, UI, CMS, Checkout, Modal ) {

		return {
			addItem: addBasketItem,
            removeItem: removeBasketItem,
            setItemQuantity: setItemQuantity,
            addCoupon: addCoupon,
            removeCoupon: removeCoupon
		};

        /**
         * @param   addBasketList
         * @param   isUpdate
         * @return  Promise
         */
        function addBasketItem( addBasketList, isUpdate ) {
            if( !!addBasketList ) {
                UI.showWaitScreen();

                API.post( '/rest/checkout/basketitemslist/', addBasketList, true)
                    .done(function() {
                        Checkout.loadCheckout()
                            .done(function() {
                                refreshBasketPreview();
                                CMS.getContainer('ItemViewItemToBasketConfirmationOverlay', '?ArticleID=' + addBasketList[0].BasketItemItemID).from('ItemView')
                                    .done(function(response) {
                                        UI.hideWaitScreen();
                                        Modal.prepare()
                                            .setTemplate(response.data[0])
                                            .setTimeout(5000)
                                            .show();
                                    });
                        });
                    })
                    .fail(function(jqXHR) {
                        var response = $.parseJSON(jqXHR.responseText);
                        if (!isUpdate && response.error.error_stack[0].code === 100) {

                            CMS.getContainer('CheckoutOrderParamsList', '?itemID=' + addBasketList[0].BasketItemItemID + '&quantity=' + addBasketList[0].BasketItemQuantity).from('Checkout')
                                .done(function(response) {
                                    UI.hideWaitScreen();
                                    Modal.prepare()
                                        .setTemplate(response.data[0])
                                        .onConfirm(function() {
                                            saveOrderParams(addBasketList)
                                        })
                                        .show();
                                });

                        } else {
                            UI.printErrors(response.error.error_stack);
                        }
                    });
            }
        }

        function saveOrderParams( addBasketList ) {
            var orderParamsForm = $('[data-plenty-checkout-form="OrderParamsForm"]');

            //Groups
            orderParamsForm.find('[name^="ParamGroup"]').each(function(){
                var match = this.name.match(/^ParamGroup\[(\d+)]\[(\d+)]$/);
                addBasketList = addOrderParamValue(addBasketList, match[1], $(this).val(), $(this).val());
            });

            //Values
            orderParamsForm.find('[name^="ParamValue"]').each(function(){

                if( ($(this).attr('type') == 'checkbox' && $(this).is(':checked')) ||
                    ($(this).attr('type') == 'radio' && $(this).is(':checked')) ||
                    ($(this).attr('type') != 'radio' && $(this).attr('type') != 'checkbox') )
                {
                    var match = this.name.match(/^ParamValue\[(\d+)]\[(\d+)]$/);
                    addBasketList = addOrderParamValue(addBasketList, match[1], match[2], $(this).val());
                }
            });

            addBasketItem( addBasketList, true );
        }

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
         * Remove item from basket
         *
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

            function doDelete() {
                UI.showWaitScreen();
                API.delete('/rest/checkout/basketitemslist/?basketItemIdsList[0]='+BasketItemID)
                    .done(function() {
                        Checkout.loadCheckout().done(function() {
                            $('[data-basket-item-id="'+BasketItemID+'"]').remove();

                            if( !Checkout.getCheckout().BasketItemsList || Checkout.getCheckout().BasketItemsList.length <= 0 ) {
                                Checkout.reloadCatContent(basketCatId);
                            } else {
                                Checkout.reloadContainer('Totals');
                                UI.hideWaitScreen();
                            }

                            refreshBasketPreview();
                        });
                    });
            }

            if( !forceDelete ) {
                Modal.prepare()
                    .setTitle('Bitte bestätigen')
                    .setContent('<p>Möchten Sie den Artikel "' + itemName + '" wirklich aus dem Warenkorb entfernen?</p>')
                    .onDismiss(function () {
                        console.log('onDismiss');
                        $('[data-basket-item-id="' + BasketItemID + '"]').find('[data-plenty="quantityInput"]').val(originalItemQuantity);
                    })
                    .onConfirm(function () {
                        doDelete();
                    })
                    .setLabelConfirm('Löschen')
                    .show();
            } else {
                doDelete();
            }
        }

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

                UI.showWaitScreen();
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
                            UI.hideWaitScreen();
                        });
                    });
            }
        }

        /**
         * Reload BasketPreview-Template and update basket totals
         */
        function refreshBasketPreview() {

            UI.showWaitScreen();
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

                    UI.hideWaitScreen();
                });

            //update quantity
            var itemQuantityTotal = 0;
            $.each( Checkout.getCheckout().BasketItemsList, function(i, basketItem) {
                itemQuantityTotal += basketItem.BasketItemQuantity;
            });

            $('[data-plenty-basket-preview="itemQuantityTotal"]').text( itemQuantityTotal );
            $('[data-plenty-basket-preview="totalsItemSum"]').text( Checkout.getCheckout().Totals.TotalsItemSum );
        }

        function addCoupon() {
            var params = {
                CouponActiveCouponCode: $('[data-plenty-checkout-form="couponCode"]').val()
            };

            UI.showWaitScreen();
            return API.post("/rest/checkout/coupon/", params)
                .done(function() {
                    Checkout.setCheckout()
                        .done(function() {
                            Checkout.reloadContainer('Coupon');
                            Checkout.reloadCatContent(checkoutConfirmCatId);
                            UI.hideWaitScreen();
                        });
                });
        }

        function removeCoupon() {
            var params = {
                CouponActiveCouponCode: Checkout.getCheckout().Coupon.CouponActiveCouponCode
            };

            UI.showWaitScreen();

            return API.delete("/rest/checkout/coupon/", params)
                .done(function() {
                    Checkout.setCheckout()
                        .done(function() {
                            delete Checkout.getCheckout().Coupon;

                            Checkout.reloadContainer('Coupon');
                            Checkout.reloadCatContent(checkoutConfirmCatId);
                            UI.hideWaitScreen();
                        });
                });
        }



	}, ['APIFactory', 'UIFactory', 'CMSFactory', 'CheckoutFactory', 'ModalFactory']);
}(PlentyFramework));