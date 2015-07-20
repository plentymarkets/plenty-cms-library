/**
 * Licensed under AGBL v3
 * (https://github.com/plentymarkets/plentymarketsCMStools/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function($, pm) {

    /* Tab Handling
     *
     * Show tab with jQuery-selector 'TAB_SELECTOR'
        <a data-plenty-opentab="TAB_SELECTOR">
     * (!) Requires bootstrap.js
     *
     * Show remote tab with jQuery-selector 'TAB_1' in target container (below)
        <span data-plenty-openremotetab="TAB_1">
     *
     */
    pm.directive('a[data-plenty-opentab]', function(i, elem) {
        // open tab
        $(elem).click(function() {
            var tabSelector = $(this).attr('data-plenty-opentab');
            tabSelector = ( tabSelector == 'href' ) ? $(this).attr('href') : tabSelector;
            $(tabSelector).tab('show');
        });
    });

    pm.directive('[data-plenty-openremotetab]', function(i, elem) {
        // open remote tab{
        $(elem).click(function () {
            var tabSelector = $(this).attr('data-plenty-openremotetab');
            $(tabSelector).trigger('tabchange');
        });
    });

    /*
     * Remote tabs
     * tab content can be placed anywhere in body
     *
     * Content of remote tab
         <div data-plenty-labelledby="TAB_1" data-plenty-remotetabs-id="REMOTE_TAB_GROUP">
            <!-- Content of TAB_1 -->
         </div>
     *
     * Remote tab navigation
     * [...]
         <div data-plenty="remoteTabs" data-plenty-remotetabs-id="REMOTE_TAB_GROUP">
             <ul>
                 <li class="active">
                     <a data-plenty-tab-id="TAB_1">
                        <!-- Title of TAB_1 -->
                     </a>
                 </li>
                 <li>
                     <a data-plenty-tab-id="TAB_2">
                        <!-- Titel of TAB_2 -->
                     </a>
                 </li>
             </ul>
         </div>
     *
     */
    pm.directive('[data-plenty="remoteTabs"]', function(i, remoteTab) {

        var tabsId = $(remoteTab).attr('data-plenty-remotetabs-id');

        // find tabs grouped by remotetabs-id
        $('[data-plenty="remoteTabs"][data-plenty-remotetabs-id="'+tabsId+'"]').each(function(i, tabs) {

            // bind each remote-tab
            $(tabs).find('a').each(function(i, singleTab) {

                var singleTabId = $(singleTab).attr('data-plenty-tab-id');

                // listen to 'tabchange' event
                $(singleTab).on('tabchange', function() {
                    // toggle class 'active'
                    $(singleTab).closest('[data-plenty="remoteTabs"]').children('.active').removeClass('active');
                    $(singleTab).closest('li').addClass('active');

                    // hide inactive tabs & show active tab
                    var tabpanelsInactive = $('[data-plenty-remotetabs-id="'+tabsId+'"][data-plenty-tabpanel-labelledby]').not('[data-plenty-tabpanel-labelledby="'+singleTabId+'"]');
                    var tabpanelActive = $('[data-plenty-remotetabs-id="'+tabsId+'"][data-plenty-tabpanel-labelledby="'+singleTabId+'"]');
                    var zIndexTabpanelParents = 0;
                    if ( $(tabs).attr('data-plenty-remotetabs-adapt') == 'tabpanel-parent' ) {
                        zIndexTabpanelParents = 2147483646;
                        $('[data-plenty-remotetabs-id="'+tabsId+'"][data-plenty-tabpanel-labelledby]').parent().each(function() {
                            var zIndexCurrent = parseInt( $(this).css('zIndex') );
                            if ( typeof zIndexCurrent == 'number' && zIndexCurrent < zIndexTabpanelParents ) zIndexTabpanelParents = zIndexCurrent;
                        });
                    }

                    // adjust z-index if neccessary
                    $(tabpanelsInactive).hide().removeClass('in');
                    $(tabpanelActive).show().addClass('in');
                    if ( zIndexTabpanelParents != 0 ) {
                        $(tabpanelsInactive).parent().css('zIndex', zIndexTabpanelParents);
                        $(tabpanelActive).parent().css('zIndex', zIndexTabpanelParents + 1);
                    }
                });
            });
        });

        // trigger 'tabchange' event
        $(remoteTab).find('a').click(function() {
            $(this).trigger('tabchange');
        });
    });

}(jQuery, PlentyFramework));