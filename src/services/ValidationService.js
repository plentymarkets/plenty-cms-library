/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function ($, pm) {

    /**
     * Provide methods for client-side form validation.
     * @class ValidationService
     * @static
     */
    pm.service( 'ValidationService', function() {

        return {
            validate: validate
        };

        /**
         * Check if element is a form element (input, select, textarea) or search for child form elements
         * @function getFormControl
         * @private
         * @param  {object} element the element to get the form element from
         * @return {object} a valid form element (input, select, textarea)
         */
        function getFormControl( element ) {
            element = $(element);
            if( element.is('input') || element.is('select') || element.is('textarea') ) {
                return element;
            } else {
                if( element.find('input').length > 0 ) {
                    return element.find('input');
                }

                else if ( element.find('select').length > 0 ) {
                    return element.find('select');
                }

                else if ( element.find('textarea').length > 0 ) {
                    return element.find('textarea');
                }

                else {
                    return null;
                }
            }

        }

        /**
         * Check given element has any value
         * @function validateText
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateText( formControl ) {
            // check if formControl is no checkbox or radio
            if ( formControl.is('input') || formControl.is('select') || formControl.is('textarea') ) {
                // check if length of trimmed value is greater then zero
                return $.trim( formControl.val() ).length > 0;

            } else {
                console.error('Validation Error: Cannot validate Text for <' + formControl.prop("tagName") + '>');
                return false;
            }
        }

        /**
         * Check given element's value is a valid email-address
         * @function validateMail
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateMail( formControl ) {
            var mailRegExp = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            if ( validateText(formControl) ) {
                return mailRegExp.test( $.trim( formControl.val() ) );
            } else {
                return false;
            }
        }

        /**
         * Check given element's value is a valid number
         * @function validateNumber
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateNumber( formControl ) {
            if ( validateText(formControl) ) {
                return $.isNumeric( $.trim( formControl.val() ) );
            } else {
                return false;
            }
        }

        /**
         * Check given element's value is equal to a references value
         * @function validateValue
         * @private
         * @param {object} formControl the form element to validate
         * @param {string} reference the required value
         * @return {boolean}
         */
        function validateValue( formControl, reference ) {
            if( $(reference).length > 0 ) {
                return $.trim( formControl.val() ) == $.trim( $(reference).val() );
            } else {
                return $.trim( formControl.val() ) == reference;
            }
        }

        function visibility( formControl ) {
            return formControl.is(':visible');
        }

        function isEnabled( formControl ) {
            return formControl.is(':enabled');
        }

        /**
         * Validate a form. Triggers event 'validationFailed' if any element has an invalid value
         * @function validate
         * @param   {object}    form The form element to validate
         * @returns {boolean}
         * @example
         *  ```html
         *      <!-- add "error-class" to invalid elements -->
         *      <form data-plenty-checkform="error-class">
         *          <!-- check if value is "text" -->
         *          <input type="text" data-plenty-validate="text">
         *
         *          <!-- check if value is a valid email-address -->
         *          <input type="text" data-plenty-validate="mail">
         *
         *          <!-- check if value is a valid number -->
         *          <input type="text" data-plenty-validate="number">
         *
         *          <!-- check if value is "foo" -->
         *          <input type="text" data-plenty-validate="value" data-plenty-validation-value="foo">
         *
         *          <!-- check if values are identical -->
         *          <input type="text" id="input1">
         *          <input type="text" data-plenty-validate="value" data-plenty-validation-value="#input1">
         *
         *          <!-- validate radio buttons -->
         *          <input type="radio" name="radioGroup" data-plenty-validate>
         *          <input type="radio" name="radioGroup" data-plenty-validate>
         *          <input type="radio" name="radioGroup" data-plenty-validate>
         *
         *          <!-- validate checkboxes -->
         *          <input type="checkbox" name="checkboxGroup" data-plenty-validate="{min: 1, max: 2}">
         *          <input type="checkbox" name="checkboxGroup" data-plenty-validate="{min: 1, max: 2}">
         *          <input type="checkbox" name="checkboxGroup" data-plenty-validate="{min: 1, max: 2}">
         *
         *          <!-- add error class to parent container -->
         *          <div data-plenty-validate="text">
         *              <label>An Input</label>
         *              <input type="text">
         *          </div>
         *
         *       </form>
         *    ```
         *
         * @example
         *      $(form).on('validationFailed', function(missingFields) {
         *          // handle missing fields
         *      });
         */
        function validate( form, errorClass ) {
            var formControl, formControls, validationKey, currentHasError, group, checked, checkedMin, checkedMax, attrValidate, validationKeys, formControlAttrType;
            var $form = $(form);
            errorClass = errorClass || 'has-error';
            var missingFields = [];
            var hasError = false;

            // check every required input inside form
            $form.find('[data-plenty-validate], input.Required').each(function(i, elem) {
                attrValidate = $(elem).attr('data-plenty-validate');
                formControls = getFormControl(elem)
                // validate text inputs
                validationKeys = !!attrValidate ? attrValidate : 'text';
                validationKeys = validationKeys.split(',');

                for(var i = 0, length = formControls.length; i < length; i++) {
                    formControl = $(formControls[i]);
                    formControlAttrType = formControl.attr('type');

                    if (!visibility(formControl) || !isEnabled(formControl)) {
                        return;
                    }

                    validationKey = validationKeys[i].trim() || validationKeys[0].trim();
                    currentHasError = false;

                    // formControl is textfield (text, mail, password) or textarea
                    if ((formControl.is('input')
                        && formControlAttrType != 'radio'
                        && formControlAttrType != 'checkbox')
                        || formControl.is('textarea')) {
                        switch (validationKey) {

                            case 'text':
                                currentHasError = !validateText(formControl);
                                break;

                            case 'mail':
                                currentHasError = !validateMail(formControl);
                                break;

                            case 'number':
                                currentHasError = !validateNumber(formControl);
                                break;

                            case 'value':
                                currentHasError = !validateValue(formControl, $(elem).attr('data-plenty-validation-value'));
                                break;

                            case 'none':
                                // do not validate
                                break;

                            default:
                                console.error('Form validation error: unknown validate property: "' + attrValidate + '"');
                                break;
                        }
                    } else if (formControl.is('input')
                        && (formControlAttrType == 'radio'
                        || formControlAttrType == 'checkbox')) {
                        // validate radio buttons
                        group = formControl.attr('name');
                        checked = $form.find('input[name="' + group + '"]:checked').length;

                        if (formControlAttrType == 'radio') {
                            checkedMin = 1;
                            checkedMax = 1;
                        } else {
                            eval("var minMax = " + attrValidate);
                            checkedMin = !!minMax ? minMax.min : 1;
                            checkedMax = !!minMax ? minMax.max : 1;
                        }

                        currentHasError = ( checked < checkedMin || checked > checkedMax );

                    } else if (formControl.is('select')) {
                        // validate selects
                        currentHasError = ( formControl.val() == '' || formControl.val() == '-1' );
                    } else {
                        console.error('Form validation error: ' + $(elem).prop("tagName") + ' does not contain an form element');
                        return;
                    }

                    if (currentHasError) {
                        hasError = true;
                        missingFields.push(formControl);

                        if(formControls.length > 1 ) {
                            formControl.addClass(errorClass);
                            $form.find('label[for="'+formControl.attr('id')+'"]').addClass(errorClass);
                        } else {
                            $(elem).addClass(errorClass);
                        }
                    }
                }

            });

            // scroll to element on 'validationFailed'
            $form.on('validationFailed', function() {
                var distanceTop = 50;
                var $error = $form.find('.has-error').first();
                var errorOffset = $error.offset().top;
                var $scrollTarget = $('html, body');

                // if form is inside of modal, scroll modal instead of body
                if( $form.parents('.modal').length > 0 ) {
                    $scrollTarget = $form.parents('.modal').find('.modal-body');
                    errorOffset = $scrollTarget.scrollTop() - ( $scrollTarget.offset().top - $error.offset().top );

                } else if( $form.is('.modal') ) {
                    $scrollTarget = $form.find('.modal-body');
                    errorOffset = $scrollTarget.scrollTop() - ( $scrollTarget.offset().top - $error.offset().top );

                }

                console.log( errorOffset, $scrollTarget );

                // only scroll if error is outside of viewport
                if( errorOffset - distanceTop < window.pageYOffset || errorOffset > (window.pageYOffset + window.innerHeight) ) {
                    $scrollTarget.animate({
                        scrollTop: errorOffset - distanceTop
                    });
                }
            });

            if ( hasError ) {
                // remove error class on focus
                $form.find('.has-error').each(function(i, elem) {
                    formControl = $(getFormControl(elem));
                    formControl.on('focus click', function() {
                        $(this).removeClass( errorClass );
                        $form.find('label[for="'+$(this).attr('id')+'"]').removeClass(errorClass);
                    });
                });

                $form.trigger('validationFailed', [missingFields]);
            }

            var callback = $form.attr('data-plenty-callback');

            if( !hasError && !!callback && callback != "submit" && typeof window[callback] == "function") {

                var fields = {};
                $form.find('input, textarea, select').each(function (){
                    if( $(this).attr('type') == 'checkbox' ) {
                        fields[$(this).attr('name')] = $(this).is(':checked');
                    } else {
                        fields[$(this).attr('name')] = $(this).val();
                    }
                });

                window[callback](fields);
                return false;
            } else {
                return !hasError;
            }
        }
    });

    /**
     * jQuery-Plugin to calling {{#crossLink "ValidationService/validate"}}ValidationService.validate{{/crossLink}}
     * on jQuery wrapped elements.
     * @return {boolean}
     */
    $.fn.validateForm = function() {
        return pm.getInstance().ValidationService.validate( this );
    };

    /**
     * jQuery-Plugin to get the values of contained form elements.
     * @return {object}
     */
    $.fn.getFormValues = function() {

        var form = this;
        var values = {};
        function inject( position, value ) {
            var match = position.match(/^([^\[]+)(.*)/);

            if( !!match[2] ) {
                var exp = /\[([^\]]+)]/g;
                var child;
                var children = [];
                children[0] = match[1];
                while( (child = exp.exec(match[2])) !== null ) {
                    children.push( child[1] );
                }

                for( var i = children.length-1; i >= 0; i-- ) {
                    var val = {};
                    val[children[i]] = value;
                    value = val;
                }
                values = $.extend(true, values, value);
            } else {
                values[match[1]] = value;
            }
        }

        form.find('input, select, textarea').each(function(i, elem) {
            if( !!$(elem).attr('name') ) {
                if ($(elem).attr('type') == "checkbox") {
                    // get checkbox group
                    var groupValues = [];
                    $(form).find('[name="' + $(elem).attr('name') + '"]:checked').each(function (j, checkbox) {
                        groupValues.push($(checkbox).val());
                    });
                    inject($(elem).attr('name'), groupValues);
                } else if ($(elem).attr('type') == 'radio') {
                    if ($(elem).is(':checked')) inject($(elem).attr('name'), $(elem).val());
                } else {
                    inject($(elem).attr('name'), $(elem).val());
                }
            }

        });
        return values;
    }
}(jQuery, PlentyFramework));