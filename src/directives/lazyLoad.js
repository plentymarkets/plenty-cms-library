/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

(function( $, pm )
{

    // lazyload images (requires lazyload.min.js)
    // TODO: handle external dependencies dependencies
    pm.directive( 'img[data-plenty-lazyload]', function( i, elem )
    {
        var $elem = $( elem );
        $elem.lazyload( {
            effect: $elem.attr( 'data-plenty-lazyload' ) || 'fadeIn'
        } );
        $elem.on( "loaded", function()
        {
            $elem.css( 'display', 'inline-block' );
        } );
    } );

}( jQuery, PlentyFramework ));