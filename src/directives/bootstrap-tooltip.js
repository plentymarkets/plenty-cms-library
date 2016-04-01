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

    // append Bootstrap Tooltip
    pm.directive( '[data-toggle="tooltip"]', function( i, elem )
    {
        $( elem ).tooltip( {
            container: 'body'
        } );
    } );

}( jQuery, PlentyFramework ));