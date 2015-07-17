/**
 * Licensed under AGBL v3
 * (https://github.com/plentymarkets/plentymarketsCMStools/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function($, pm) {

	pm.directive('[data-plenty="addBasketItemButton"]', function(i, button, BasketService)
    {

        $(button).click( function(e)
        {
            // avoid directing to href
            e.preventDefault();

            //init
            var basketItemsList	= {};
            var parentForm		= $(button).parents('form');

            basketItemsList.BasketItemItemID	= parentForm.find('[name="ArticleID"]').val();
            basketItemsList.BasketItemPriceID	= parentForm.find('[name="SYS_P_ID"]').val();
            basketItemsList.BasketItemQuantity	= parentForm.find('[name="ArticleQuantity"]').val();
            basketItemsList.BasketItemBranchID	= parentForm.find('[name="source_category"]').val();

            //attributes
            var attributeInputsList = parentForm.find('[name^="ArticleAttribute"]');
            var attributesList = [];

            $.each(attributeInputsList, function (idx, elem) {
                var match = elem.name.match(/^ArticleAttribute\[\d+]\[\d+]\[(\d+)]$/);
                if(match && match[1]) // erst prüfen, ob es das Array überhaupt gibt.
                {
                    attributesList.push({
                        BasketItemAttributeID 		: match[1],
                        BasketItemAttributeValueID	: $(elem).val()
                    });
                }
            });

            if(attributesList.length != 0)
            {
                basketItemsList.BasketItemAttributesList = attributesList;
            }

            //add basketItem and refresh previewLists
            BasketService.addItem([basketItemsList]);

        });
    }, ['BasketService']);
} (jQuery, PlentyFramework));