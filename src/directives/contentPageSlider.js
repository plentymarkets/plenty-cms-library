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


    /*
     * content page slider
     *
     * usage (functionality requires only attribute data-plenty="contentpageSlider"):
     * <div class="contentpageSlider" data-plenty="contentpageSlider">
     *     <div class="slide">
     *         ...
     *     </div>
     *     <div class="slide">
     *         ...
     *     </div>
     *     ...
     * </div>
     */
    pm.directive( '[data-plenty="contentpageSlider"]', function( i, elem )
    {
        $( elem ).owlCarousel( {
            navigation     : true,
            navigationText : false,
            slideSpeed     : 1000,
            paginationSpeed: 1000,
            singleItem     : true,
            autoPlay       : 6000,
            stopOnHover    : true,
            afterMove      : function( current )
            {
                $( current ).find( 'img[data-plenty-lazyload]' ).trigger( 'appear' );
            }
        } );
    } );

}( jQuery, PlentyFramework ));