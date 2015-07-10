(function ($, pm) {

    pm.service( 'ValidationService', function() {


        function getFormControl( element ) {
            if( $(element).is('input') || $(element).is('select') || $(element).is('textarea') ) {
                return $(element);
            } else {
                if( $(element).find('input').length > 0 ) {
                    return $(element).find('input');
                }

                else if ( $(element).find('select').length > 0 ) {
                    return $(element).find('select');
                }

                else if ( $(element).find('textarea').length > 0 ) {
                    return $(element).find('textarea');
                }

                else {
                    return null;
                }
            }

        }

        function validateText( formControl ) {
            // check if formControl is no checkbox or radio
            if ( $(formControl).is('input') || $(formControl).is('select') || $(formControl).is('textarea') ) {
                // check if length of trimmed value is greater then zero
                return $.trim( $(formControl).val() ).length > 0;

            } else {
                console.error('Validation Error: Cannot validate Text for <' + $(formControl).prop("tagName") + '>');
                return false;
            }
        }

        function validateMail( formControl ) {
            var mailRegExp = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            if ( validateText(formControl) ) {
                return mailRegExp.test( $.trim( $(formControl).val() ) );
            } else {
                return false;
            }
        }

        function validateNumber( formControl ) {
            if ( validateText(formControl) ) {
                return $.isNumeric( $.trim( $(formControl).val() ) );
            } else {
                return false;
            }
        }

        function validateValue( formControl, reference ) {
            if( $(reference).length > 0 ) {
                return $.trim( $(formControl).val() ) == $.trim( $(reference).val() );
            } else {
                return $.trim( $(formControl).val() ) == reference;
            }
        }

        function validate( form ) {
            var errorClass = !!$(form).attr('data-plenty-checkform') ? $(form).attr('data-plenty-checkform') : 'has-error';
            var missingFields = [];


            var hasError = false;

            // check every required input inside form
            form.find('[data-plenty-validate], input.Required').each(function(i, elem) {

                // validate text inputs
                var validationKeys = !!$(elem).attr('data-plenty-validate') ? $(elem).attr('data-plenty-validate') : 'text';
                validationKeys = validationKeys.split(',');

                var formControls = getFormControl(elem);
                for(i = 0; i < formControls.length; i++) {
                    var formControl = formControls[i];
                    var validationKey = validationKeys[i].trim() || validationKeys[0].trim();

                    if (!$(formControl).is(':visible') || !$(formControl).is(':enabled')) {
                        return;
                    }
                    var currentHasError = false;


                    // formControl is textfield (text, mail, password) or textarea
                    if (($(formControl).is('input') && $(formControl).attr('type') != 'radio' && $(formControl).attr('type') != 'checkbox') || $(formControl).is('textarea')) {

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
                                console.error('Form validation error: unknown validate property: "' + $(elem).attr('data-plenty-validate') + '"');
                                break;
                        }
                    } else if ($(formControl).is('input') && ($(formControl).attr('type') == 'radio' || $(formControl).attr('type') == 'checkbox')) {
                        // validate radio buttons
                        var group = $(formControl).attr('name');
                        var checked, checkedMin, checkedMax;
                        checked = $(form).find('input[name="' + group + '"]:checked').length;

                        if ($(formControl).attr('type') == 'radio') {
                            checkedMin = 1;
                            checkedMax = 1;
                        } else {
                            eval("var minMax = " + $(elem).attr('data-plenty-validate'));
                            checkedMin = !!minMax ? minMax.min : 1;
                            checkedMax = !!minMax ? minMax.max : 1;
                        }

                        currentHasError = ( checked < checkedMin || checked > checkedMax );

                    } else if ($(formControl).is('select')) {
                        // validate selects
                        currentHasError = ( $(formControl).val() == '' || $(formControl).val() == '-1' );
                    } else {
                        console.error('Form validation error: ' + $(elem).prop("tagName") + ' does not contain an form element');
                        return;
                    }

                    if (currentHasError) {
                        hasError = true;
                        missingFields.push(formControl);

                        if(formControls.length > 1 ) {
                            $(formControl).addClass(errorClass);
                            $(form).find('label[for="'+$(formControl).attr('id')+'"]').addClass(errorClass);
                        } else {
                            $(elem).addClass(errorClass);
                        }
                    }
                }
            });

            if ( hasError ) {
                // remove error class on focus
                form.find('.has-error').each(function(i, elem) {
                    var formControl = getFormControl(elem);
                    $(formControl).on('focus click', function() {
                        $(formControl).removeClass( errorClass );
                        $(form).find('label[for="'+$(formControl).attr('id')+'"]').removeClass(errorClass);
                        $(elem).removeClass( errorClass );
                    });
                });

                form.trigger('validationFailed', [missingFields]);
            }

            var callback = form.attr('data-plenty-callback');
            if( !hasError && !!callback && callback != "submit" && typeof window[callback] == "function") {

                var fields = {};
                form.find('input, textarea, select').each(function (){
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

        return {
            validate: validate
        }
    });

    $.fn.validateForm = function() {
        return pm.getInstance().FormValidator.validate( this );
    };

    /**
     * Get the values of inner form elements.
     * @return { input.name : input.value }
     */
    $.fn.getFormValues = function() {
        var values = {};
        this.find('input, select, textarea').each(function(i, elem) {
            if( $(elem).attr('type') == "checkbox" ) {
                values[$(elem).attr('name')] = $(elem).is(':checked') ? $(elem).val() : null;
            } else if( $(elem).attr('type') == 'radio' ) {
                if( $(elem).is(':checked') ) values[$(elem).attr('name')] = $(elem).val();
            } else {
                values[$(elem).attr('name')] = $(elem).val();
            }
        });
        return values;
    }
}(jQuery, PlentyFramework));