(function( $, pm )
{
    pm.directive( 'Tab', function( MediaSize )
    {

        var tabGroups = {};

        return {
            showTab        : showTab,
            initRemoteLabel: initRemoteLabel,
            initRemoteTab  : initRemoteTab,
            showRemoteTab  : showRemoteTab
        };

        function showTab( tabSelector )
        {
            $( tabSelector ).tab( 'show' );
        }

        function initRemoteLabel( $elem, tabID, groupID )
        {
            if ( !tabGroups[groupID] )
            {
                tabGroups[groupID] = new TabGroup();
            }

            if ( !tabGroups[groupID].getTab( tabID ) )
            {
                tabGroups[groupID].addTab( tabID );
            }

            tabGroups[groupID].getTab( tabID ).addLabel( $elem );
        }

        function initRemoteTab( $elem, tabID, groupID )
        {
            if ( !tabGroups[groupID] )
            {
                tabGroups[groupID] = new TabGroup();
            }

            if ( !tabGroups[groupID].getTab( tabID ) )
            {
                tabGroups[groupID].addTab( tabID );
            }

            tabGroups[groupID].getTab( tabID ).setContent( $elem );
        }

        function showRemoteTab( tabID, groupID, interval )
        {
            if( MediaSize.isInterval( interval ) )
            {
                pm.getRecentEvent().preventDefault();

                if ( !!tabGroups[groupID] && !!tabGroups[groupID].getTab( tabID ) )
                {
                    tabGroups[groupID].showTab( tabID );
                }
            }
        }

        function TabGroup()
        {
            var tabs = {};
            var activeTab;

            return {
                addTab : addTab,
                showTab: showTab,
                getTab : getTab
            };

            function addTab( tabID )
            {
                tabs[tabID] = new Tab( tabID );
                return tabs[tabID];
            }

            function showTab( tabID )
            {
                var zIndex = 0;
                if ( !!activeTab )
                {
                    // activeTab is set
                    zIndex = parseInt( activeTab.getContent().parent().css( 'zIndex' ) );
                    activeTab.hide();
                    activeTab.getContent().parent().css( 'zIndex', zIndex - 1 );
                }
                else
                {
                    // activeTab not set before
                    for ( var tab in tabs )
                    {
                        if( !!tabs[tab].getContent() )
                        {
                            var currentZ = parseInt( tabs[tab].getContent().parent().css( 'zIndex' ) );
                            if ( zIndex == 0 || currentZ < zIndex )
                            {
                                zIndex = currentZ;
                            }
                            tabs[tab].hide();
                        }
                    }

                    for ( var tab in tabs )
                    {
                        if( !!tabs[tab].getContent() )
                        {
                            tabs[tab].getContent().parent().css( 'zIndex', zIndex - 1 );
                        }
                    }
                }

                activeTab = tabs[tabID];
                activeTab.getContent().parent().css( 'zIndex', zIndex );
                activeTab.show();
            }

            function getTab( tabID )
            {
                return tabs[tabID];
            }
        }

        function Tab( id )
        {
            var $labels = [];
            var $content;
            var tabID = id;

            return {
                addLabel  : addLabel,
                setContent: setContent,
                getContent: getContent,
                getID     : getID,
                show      : show,
                hide      : hide
            };

            function getID()
            {
                return tabID;
            }

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
                for ( var i = 0; i < $labels.length; i++ )
                {
                    $labels[i].addClass( 'active' );
                }

                if ( !!$content )
                {
                    $content.show().addClass( 'in' );
                }

            }

            function hide()
            {
                for ( var i = 0; i < $labels.length; i++ )
                {
                    $labels[i].removeClass( 'active' );
                }

                if ( !!$content )
                {
                    $content.hide().removeClass( 'in' );
                }
            }
        }

    }, ['MediaSizeService'] );
})( jQuery, PlentyFramework );