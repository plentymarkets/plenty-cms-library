(function ($) {
    /****************************************
     *              ITEM FUNCTIONS            *
     ****************************************/

    /**
     * @param   addBasketList
     * @param   isUpdate
     * @return  Promise
     */
    CheckoutManager.addBasketItem = function (addBasketList, isUpdate) {
        if (!!addBasketList) {
            CheckoutManager.showWaitScreen();

            return $.ajax(
                "/rest/checkout/basketitemslist/",
                {
                    type: 'POST',
                    data: JSON.stringify(addBasketList),
                    dataType: 'json',
                    success: function () {
                        CheckoutManager.getCheckout().done(function () {
                            CheckoutManager.refreshBasketPreview();
                            $('[data-plenty-id="dynamicModal"]').prepareModal({
                                contentURL: '/rest/itemview/container_itemviewitemtobasketconfirmationoverlay/?ArticleID=' + addBasketList[0].BasketItemItemID,
                                timeout: 5000,
                                afterRequest: function () {
                                    CheckoutManager.hideWaitScreen();
                                }
                            });
                        });
                    },
                    error: function (jqXHR, status, thrownError) {
                        var response = $.parseJSON(jqXHR.responseText);
                        if (!isUpdate && response.error.error_stack[0].code != undefined && response.error.error_stack[0].code == 100) {
                            CheckoutManager.currentBasketItemRequest = addBasketList;
                            $('[data-plenty-id="dynamicModal"]').prepareModal({
                                contentURL: '/rest/checkout/container_checkoutorderparamslist/?itemID=' + addBasketList[0].BasketItemItemID + '&quantity=' + addBasketList[0].BasketItemQuantity,
                                afterRequest: function () {
                                    CheckoutManager.hideWaitScreen();
                                }

                            });
                        }
                        else {
                            CheckoutManager.handleError(jqXHR, status, thrownError);
                        }

                    }
                }
            );
        }
    };

    CheckoutManager.addOrderParamValue = function (position, paramId, paramValue) {
        if (position > 0 && CheckoutManager.currentBasketItemRequest[position] == undefined) {
            CheckoutManager.currentBasketItemRequest[position] = $.extend(true, {},
                                                                          CheckoutManager.currentBasketItemRequest[0]);
            CheckoutManager.currentBasketItemRequest[position].BasketItemOrderParamsList = [];
        }

        if (CheckoutManager.currentBasketItemRequest[position] != undefined) {
            CheckoutManager.currentBasketItemRequest[position].BasketItemQuantity = 1;
            if (CheckoutManager.currentBasketItemRequest[position].BasketItemOrderParamsList == undefined) {
                CheckoutManager.currentBasketItemRequest[position].BasketItemOrderParamsList = [];
            }

            CheckoutManager.currentBasketItemRequest[position].BasketItemOrderParamsList.push({
                BasketItemOrderParamID: paramId,
                BasketItemOrderParamValue: paramValue
            });
        }
    };

    /**
     * OrderForm to JSON wrapper
     */
    new PlentyFunction('[data-plenty="addBasketItemButton"]', function (elem) {
        $(elem).each(function (i, button) {
            $(button).click(function (e) {
                // avoid directing to href
                e.preventDefault();

                //init
                var basketItemsList = {};
                var parentForm = button.parents('form');

                basketItemsList.BasketItemItemID = parentForm.find('[name="ArticleID"]').val();
                basketItemsList.BasketItemPriceID = parentForm.find('[name="SYS_P_ID"]').val();
                basketItemsList.BasketItemQuantity = parentForm.find('[name="ArticleQuantity"]').val();
                basketItemsList.BasketItemBranchID = parentForm.find('[name="source_category"]').val();

                //attributes
                var attributeInputsList = parentForm.find('[name^="ArticleAttribute"]');
                var attributesList = [];

                $.each(attributeInputsList, function (idx, elem) {
                    var match = elem.name.match(/^ArticleAttribute\[\d+]\[\d+]\[(\d+)]$/);
                    if (match && match[1]) // erst prüfen, ob es das Array überhaupt gibt.
                    {
                        attributesList.push({
                            BasketItemAttributeID: match[1],
                            BasketItemAttributeValueID: $(attributeInput).val()
                        });
                    }
                });

                if (attributesList.length != 0) {
                    basketItemsList.BasketItemAttributesList = attributesList;
                }

                //add basketItem and refresh previewLists
                CheckoutManager.addBasketItem([basketItemsList]);

            });
        });
    });

    new PlentyFunction('[data-plenty="saveBasketOrderParams"]', function (elem) {
        $(elem).each(function (i, button) {
            $(button).click(function () {
                if (CheckoutManager.currentBasketItemRequest != undefined) {
                    var parentForm = button.parents('form');

                    //Groups
                    parentForm.find('[name^="ParamGroup"]').each(function () {
                        var match = this.name.match(/^ParamGroup\[(\d+)]\[(\d+)]$/);
                        CheckoutManager.addOrderParamValue(match[1], $(this).val(), $(this).val());
                    });

                    //Values
                    parentForm.find('[name^="ParamValue"]').each(function () {

                        if (($(this).attr('type') == 'checkbox' && $(this).is(':checked')) ||
                            ($(this).attr('type') == 'radio' && $(this).is(':checked')) ||
                            ($(this).attr('type') != 'radio' && $(this).attr('type') != 'checkbox')) {
                            var match = this.name.match(/^ParamValue\[(\d+)]\[(\d+)]$/);
                            CheckoutManager.addOrderParamValue(match[1], match[2], $(this).val());
                        }
                    });

                    CheckoutManager.addBasketItem(CheckoutManager.currentBasketItemRequest, true);
                }
            });
        });
    });

    /****************************************
     *            BASKET FUNCTIONS            *
     ****************************************/

    /**
     * Remove item from basket
     *
     * @return Promise
     */
    CheckoutManager.removeBasketItem = function () {

        if (!!CheckoutManager.currentBasketItemID && CheckoutManager.currentBasketItemID > 0) {
            CheckoutManager.showWaitScreen();
            return $.ajax(
                "/rest/checkout/basketitemslist/?basketItemIdsList[0]=" + CheckoutManager.currentBasketItemID,
                {
                    type: 'DELETE',
                    success: function () {
                        CheckoutManager.getCheckout().done(function () {
                            $('[data-basket-item-id="' + CheckoutManager.currentBasketItemID + '"]').remove();

                            if (!CheckoutManager.checkout.BasketItemsList || CheckoutManager.checkout.BasketItemsList.length <= 0) {

                                CheckoutManager.reloadCatContent(basketCatId);

                            }
                            else {
                                CheckoutManager.reloadContainer('Totals');
                                // reset currentBasketItemID
                                delete CheckoutManager.currentBasketItemID;
                                CheckoutManager.hideWaitScreen();
                            }

                            CheckoutManager.refreshBasketPreview();
                        });
                    },
                    error: CheckoutManager.handleError
                }
            );
        }
    };

    /**
     * Set basket item quantity
     *
     * - updates quantity on server and in client-side CheckoutManager object
     * - doesn't include security query if setting quantity 0
     *
     * - requires HTML:        [data-basket-item-id="CONTAINS_BASKET_ITEM_ID"]        ...wraps basket list item,
     * attribute contains BasketItemID
     *                    [data-plenty-checkout="basket-item-price-total"]    ...html-container which contains
     * BasketItemPriceTotal
     *
     * @param   BasketItemID
     * @param   BasketItemQuantity
     * @return  Promise
     */
    CheckoutManager.setItemQuantity = function (BasketItemID, BasketItemQuantity) {

        // delete item if quantity is 0
        if (BasketItemQuantity <= 0) {
            CheckoutManager.currentBasketItemID = BasketItemID;
            return CheckoutManager.confirmDeleteBasketItem(BasketItemID);
        }

        var params = CheckoutManager.checkout.BasketItemsList;

        for (var i = 0; i < params.length; i++) {
            if (params[i].BasketItemID == BasketItemID) {
                params[i].BasketItemQuantity = parseInt(BasketItemQuantity);
            }
        }

        CheckoutManager.showWaitScreen();
        return $.ajax(
            "/rest/checkout/basketitemslist/",
            {
                data: JSON.stringify(params),
                dataType: 'json',
                type: 'POST',
                success: function () {
                    CheckoutManager.setCheckout().done(function () {
                        CheckoutManager.reloadContainer('Totals');

                        var basketItemsPriceTotal = 0;
                        var params2 = CheckoutManager.checkout.BasketItemsList;
                        for (var i = 0; i < params2.length; i++) {
                            if (params2[i].BasketItemID == BasketItemID) {
                                basketItemsPriceTotal = params2[i].BasketItemPriceTotal;
                            }
                        }
                        $('[data-basket-item-id="' + BasketItemID + '"]').find('[data-plenty-checkout="basket-item-price-total"]').html(basketItemsPriceTotal);
                        CheckoutManager.refreshBasketPreview();
                        CheckoutManager.hideWaitScreen();
                    });
                },
                error: CheckoutManager.handleError
            }
        );

    };


    /**
     * Confirm delete basket item
     *
     * - creates modal to confirm deleting item from basket (using delete-button oder setting quantity 0)
     * - quantity 0 may be resetted after cancelling to resetItemQuantityTo
     *
     * - requires HTML:        [data-basket-item-id="CONTAINS_BASKET_ITEM_ID"]        ...wraps basket list item,
     * attribute contains BasketItemID
     *                    [data-plenty="quantityInput"]                        ...quantity input of basket list item
     *
     * @param   BasketItemID
     * @return  Promise
     */
    CheckoutManager.confirmDeleteBasketItem = function (BasketItemID) {

        // set currentBasketItemID
        CheckoutManager.currentBasketItemID = BasketItemID;

        // get item name
        var itemName, originalItemQuantity;
        var params = CheckoutManager.checkout.BasketItemsList;
        for (var i = 0; i < params.length; i++) {
            if (params[i].BasketItemID == BasketItemID) {
                originalItemQuantity = params[i].BasketItemQuantity;
                itemName = params[i].BasketItemNameMap[1];
            }
        }


        var confirmationModal = $('[data-plenty-checkout="confirm-delete-basket-item"]');

        // insert item name
        confirmationModal.find('[data-plenty-checkout="itemName"]').text(itemName);

        // show modal
        $(confirmationModal).modal('show');

        // reset item quantity on cancel
        $(confirmationModal).on('hidden.bs.modal', function () {
            $('[data-basket-item-id="' + BasketItemID + '"]').find('[data-plenty="quantityInput"]').val(originalItemQuantity);
        });

    };


    /**
     * Reload BasketPreview-Template and update basket totals
     */
    CheckoutManager.refreshBasketPreview = function () {

        CheckoutManager.showWaitScreen();
        CheckoutManager.reloadItemContainer('BasketPreviewList').done(function () {

            $('[data-plenty-basket-empty]').each(function (i, elem) {
                var toggleClass = $(elem).attr('data-plenty-basket-empty');
                if (CheckoutManager.checkout.BasketItemsList.length <= 0) {
                    $(elem).addClass(toggleClass);
                }
                else {
                    $(elem).removeClass(toggleClass);
                }
            });
            CheckoutManager.hideWaitScreen();
        });

        //update quantity
        var itemQuantityTotal = 0;
        $.each(CheckoutManager.checkout.BasketItemsList, function (i, basketItem) {
            itemQuantityTotal += basketItem.BasketItemQuantity;
        });

        $('[data-plenty-basket-preview="itemQuantityTotal"]').text(itemQuantityTotal);
        $('[data-plenty-basket-preview="totalsItemSum"]').text(CheckoutManager.checkout.Totals.TotalsItemSum);
    };

    /**
     * Handle ItemQuantityButtons:
     * Trigger 'change' on depending QuantityInput after a delay.
     */
    new PlentyFunction('[data-basket-item-id] [data-plenty="quantityInputButtonPlus"], [data-basket-item-id] [data-plenty="quantityInputButtonMinus"]',
                       function (elem) {
                           $(elem).each(function (i, button) {
                               $(button).click(function () {

                                   if (!!$(button).data('timeout')) {
                                       clearTimeout($(button).data('timeout'));
                                   }

                                   var timeout = setTimeout(function () {
                                       $(button).parents('[data-plenty="quantityInputWrapper"]').find('[data-plenty="quantityInput"]').trigger('change');
                                   }, 1000);

                                   $(button).data('timeout', timeout);

                               });
                           });
                       });

    /**
     * Handle QuantityInput's change:
     * Check if value really has changed and update if necessary
     */
    new PlentyFunction('[data-basket-item-id] [data-plenty="quantityInput"]', function (elem) {
        $(elem).each(function (i, input) {
            $(input).change(function () {

                var newQuantity = parseInt($(input).val());
                // set parsed value to avoid invalid characters
                $(input).val(newQuantity);

                var basketItemID = $(input).parents('[data-basket-item-id]').attr('data-basket-item-id');


                // check if value has changed
                var valueChanged = true;
                $.each(CheckoutManager.checkout.BasketItemsList, function (i, BasketItem) {

                    // break if quantity is not changed
                    if (BasketItem.BasketItemID == basketItemID && BasketItem.BasketItemQuantity == newQuantity) {
                        valueChanged = false;
                        return false;
                    }

                });

                if (valueChanged) {
                    CheckoutManager.setItemQuantity(
                        basketItemID,
                        newQuantity
                    );
                }
            });
        });
    });
})(jQuery);