(function( $, pm ) {
    pm.directive( 'Tab', function() {

        var tabGroups = {};

        return {
            showTab: showTab,
            initRemoteLabel: initRemoteLabel,
            initRemoteTab: initRemoteTab,
            showRemoteTab: showRemoteTab
        };

        function showTab( tabSelector )
        {
            $( tabSelector ).tab( 'show' );
        }

        function initRemoteLabel( $elem, tabID, groupID )
        {
            if( !tabGroups[groupID] )
            {
                tabGroups[groupID] = new TabGroup();
            }

            if( !tabGroups[groupID].getTab(tabID) )
            {
                tabGroups[groupID].addTab( tabID );
            }

            tabGroups[groupID].getTab( tabID ).addLabel( $elem );
        }

        function initRemoteTab( $elem, tabID, groupID )
        {
            if( !tabGroups[groupID] )
            {
                tabGroups[groupID] = new TabGroup();
            }

            if( !tabGroups[groupID].getTab(tabID) )
            {
                tabGroups[groupID].addTab( tabID );
            }

            tabGroups[groupID].getTab( tabID ).setContent( $elem );
        }

        function showRemoteTab( tabID, groupID )
        {
            if( !!tabGroups[groupID] && !!tabGroups[groupID].getTab( tabID ) )
            {
                tabGroups[groupID].showTab( tabID );
            }
        }

        function TabGroup()
        {
            var tabs = {};
            var activeTab;

            return {
                addTab: addTab,
                showTab: showTab,
                getTab: getTab
            };

            function addTab( tabID )
            {
                tabs[tabID] = new Tab();
                return tabs[tabID];
            }

            function showTab( tabID )
            {
                var zIndex = 0;
                if( !!activeTab )
                {
                    zIndex = parseInt( activeTab.getContent().parent().css('zIndex') );
                    activeTab.hide();
                    activeTab.getContent().parent().css('zIndex', zIndex-1);
                }
                else
                {
                    for( var tab in tabs )
                    {
                        var currentZ = parseInt( tabs[tab].getContent().parent().css( 'zIndex' ) );
                        if( zIndex == 0 || currentZ < zIndex )
                        {
                            zIndex = currentZ;
                        }
                        tabs[tab].hide();
                    }

                    for( var tab in tabs )
                    {
                        tabs[tab].getContent().parent().css('zIndex', zIndex);
                    }
                }

                activeTab = tabs[tabID];
                activeTab.getContent().parent().css('zIndex', zIndex);
                activeTab.show();
            }

            function getTab( tabID )
            {
                return tabs[tabID];
            }
        }

        function Tab()
        {
            var $labels = [];
            var $content;

            return {
                addLabel: addLabel,
                setContent: setContent,
                getContent: getContent,
                show: show,
                hide: hide
            };

            function addLabel( label )
            {
                $labels.push( label );
                return this;
            }

            function setContent( content )
            {
                $content = content;
                return this;
            }

            function getContent()
            {
                return $content;
            }

            function show()
            {
                for( var i = 0; i < $labels.length; i++ )
                {
                    $labels[i].addClass('active');
                }

                if( !!$content )
                {
                    $content.show().addClass( 'in' );
                }


            }

            function hide()
            {
                for( var i = 0; i < $labels.length; i++ )
                {
                    $labels[i].removeClass('active');
                }

                if( !!$content )
                {
                    $content.hide().removeClass( 'in' );
                }
            }
        }



    });
})(jQuery, PlentyFramework);