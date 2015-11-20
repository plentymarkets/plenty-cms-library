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
     * Form Validation
     * Validate required form inputs as given type of value
     * Usage / data-Attributes:
     * <form data-plenty-checkform="ERROR_CLASS">		This will activate the script for this form
     *													and add ERROR_CLASS to invalid elements
     *
     * <input data-plenty-validate="text">				Check if the value of this input is text (or number) and add ERROR_CLASS on failure
     * <div data-plenty-validate="text"><input></div>	You can put the data-plenty-validate="" on a parent element of an input.
     *													This will check the value of the input(s) inside and add ERROR_CLASS to the <div> on failure

     *	possible values for data-plenty-validate=""		text	: validate if value is text (or number or mixed)
     *													mail	: checks if value is a valid mail-address (not depending on inputs type-attribute)
     *													number: checks if value is a numeric value. For detailed information see: isNumberic()
     *													{min: 1, max: 3} validate that at least 'min' and maximum 'max' options are selected (checkboxes)
     *
     * possible form elements to validate				<input type="text | mail | password">
     * 													<textarea></textarea>					can validate "text", "mail", "number"
     *													<input type="radio" name="myRadio"> 	check if one radio-button in group "myRadio" is checked.
     *																							Ignores the value of data-plenty-validate
     *													<input type="checkbox" name="myCheck">	check if one checkbox in group "myCheck" is checked or use
     *																							data-plenty-valudate="{min: 3, max: 5}" to define custom range
     *													<select></select>						check if an option is selected and otions value is not "-1" (plenty default for: "choose"-option)
     *
     * Events:
     * 'validationFailed'								will be triggered if at least one element is not valid.
     *													Usage:
     *													form.on('validationFailed', function(event, invalidFields) {
     *	 													$(invalidFields).each({
     *															// manipulate invalid fields
     *														});
     *													});
     */
    pm.directive( 'form[data-plenty-checkform], form.PlentySubmitForm', function( i, elem, ValidationService )
    {

        $( elem ).submit( function()
        {
            return ValidationService.validate( elem );
        } );

    }, ['ValidationService'] );

}( jQuery, PlentyFramework ));