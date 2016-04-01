/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

PlentyFramework.compile();

// Create global instance of PlentyFramework for usage in Webshop-Layouts
var plenty = PlentyFramework.getInstance();

/*
 * initially bind all registered directives
 *
 * will not be tested. reasons:
 * http://stackoverflow.com/questions/29153733/how-to-unit-test-a-document-ready-function-using-jasmine
 */
jQuery( document ).ready( function()
{
    plenty.bindDirectives();
} );