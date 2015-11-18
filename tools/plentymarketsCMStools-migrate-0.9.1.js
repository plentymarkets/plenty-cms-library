(function( $, pm )
{

    PlentyFramework.getInstance().bindDirectives = function( rootElement )
    {

        var $rootElement = $( rootElement || 'body' );

        $rootElement.find( '[data-plenty="addBasketItemButton"]' ).each( function( i, button )
        {

            $( button ).click( function( e )
            {
                e.preventDefault();
                pm.directives['Basket'].addBasketItem( button );
            } );

        } );

        $rootElement.find( '[data-plenty="quantityInputButtonPlus"]' ).each( function( i, button )
        {

            $( button ).click( function()
            {
                pm.directives['Basket'].changeItemQuantity( button, 1 );
            } );

        } );

        $rootElement.find( '[data-plenty="quantityInputButtonMinus"]' ).each( function( i, button )
        {

            $( button ).click( function()
            {
                pm.directives['Basket'].changeItemQuantity( button, -1 );
            } );

        } );

        $rootElement.find( '[data-basket-item-id] [data-plenty="quantityInput"]' ).each( function( i, input )
        {

            $( input ).on( 'change', function()
            {
                var basketItemID = self.parents( '[data-basket-item-id]' ).attr( 'data-basket-item-id' );
                pm.directives['Basket'].setItemQuantity( basketItemID, input );
            } );

        } );

        $rootElement.find( 'form[data-plenty-checkform], form.PlentySubmitForm' ).each( function( i, form )
        {

            $( form ).submit( function()
            {
                return pm.directives['Validator'].validate( form, $( form ).attr( '[data-plenty-checkform]' ) || 'has-error' );
            } );

        } );

        $rootElement.find( 'a[data-plenty-opentab]' ).each( function( i, elem )
        {

            $( elem ).click( function()
            {
                var tabSelector = $( this ).attr( 'data-plenty-opentab' );
                tabSelector     = ( tabSelector == 'href' ) ? $( this ).attr( 'href' ) : tabSelector;
                pm.directives['Tab'].showTab( tabSelector );
            } );

        } );

        $rootElement.find( '[data-plenty-openremotetab]' ).each( function( i, elem )
        {

            $( elem ).click( function()
            {
                var tabSelector = $( this ).attr( 'data-plenty-openremotetab' );
                var tabID       = $( tabSelector ).attr( 'data-plenty-tab-id' );
                var groupID     = $( tabSelector ).parents( '[data-plenty-remotetabs-id]' ).attr( 'data-plenty-remotetabs-id' );

                pm.directives['Tab'].showRemoteTab( tabID, groupID );
            } );

        } );

        $rootElement.find( '[data-plenty-remotetabs-id][data-plenty-tabpanel-labelledby]' ).each( function( i, elem )
        {

            var tabID   = $( elem ).attr( 'data-plenty-remotetabs-id' );
            var groupID = $( elem ).attr( 'data-plenty-tabpanel-tabelledby' );
            pm.directives['Tab'].initRemoteTab( $( elem ), tabID, groupID );

        } );

        $rootElement.find( '[data-plenty="remoteTabs"]' ).each( function( i, elem )
        {

            var groupID = $( elem ).attr( 'data-plenty-remotetabs-id' );

            $( elem ).find( '[data-plenty-tab-id]' ).each( function( i, trigger )
            {
                var tabID = $( trigger ).attr( 'data-plenty-tab-id' );

                pm.directives['Tab'].initRemoteLabel( $( trigger ).parent(), tabID, groupID );

                $( trigger ).click( function()
                {
                    pm.directives['Tab'].showRemoteTab( tabID, groupID );
                } );
            } );
        } );

        $rootElement.find( '[data-plenty-link]' ).each( function( i, elem )
        {

            $( elem ).click( function()
            {
                var itemID = $( elem ).attr( 'data-plenty-link' );
                pm.directives['Redirect'].to( '[data-plenty-href="' + itemID + '"]' )
            } );

        } );

        $rootElement.find( '[data-plenty-checkout-href]' ).each( function( i, elem )
        {

            $( elem ).click( function()
            {
                pm.directives['Redirect'].toCheckoutTab(
                    $( elem ).attr( 'data-plenty-checkout-href' )
                )
            } );

        } );

        $rootElement.find( '[data-plenty-toggle]' ).each( function( i, elem )
        {

            $( elem ).click( function()
            {
                var dataString = $( elem ).attr( 'data-plenty-toggle' );
                var data       = (new Function( "return " + dataString )).call();
                var media      = data.media.replace( ' ', ',' );

                pm.directives['UI'].toggleClass( data.class, data.target, media );
            } );

        } );

    };

})( jQuery, PlentyFramework );