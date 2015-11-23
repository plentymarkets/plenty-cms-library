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
    pm.directive( 'Authentication', function( AuthenticationService )
    {
        return {
            login: login
        };

        function login( elem )
        {
            pm.getRecentEvent().preventDefault();
            AuthenticationService.customerLogin( $( event.target ) );
        }
    }, ["AuthenticationService"] );

}( jQuery, PlentyFramework ));