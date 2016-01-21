(function( $, pm )
{
    pm.directive( 'Redirect', function( MediaSizeService, NavigatorService )
    {

        return {
            to           : to,
            toCheckoutTab: toCheckoutTab
        };

        function to( href )
        {
            if ( MediaSizeService.interval() != 'xs' )
            {
                if ( typeof href === 'string' && href.indexOf('/') == -1 && $( href ).length > 0 )
                {
                    window.location.assign( $( href ).attr( 'href' ) );
                }
                else
                {
                    window.location.assign( href );
                }
            }
        }

        function toCheckoutTab( tabID )
        {
            NavigatorService.goToID( tabID );
        }

    }, ['MediaSizeService', 'NavigatorService'] );
}( jQuery, PlentyFramework ));