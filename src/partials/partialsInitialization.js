(function( $ )
{

    $( document ).on( 'initPartials', function( e, root )
    {

        $( root ).find( '[data-toggle="tooltip"]' ).tooltip( {
            container: 'body'
        } );

    } );

})( jQuery );