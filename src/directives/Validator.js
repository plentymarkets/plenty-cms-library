(function($, pm) {
	pm.directive('Validator', function( ValidationService ) {

        return {
            validate: validate
        };

        function validate( form, errorClass )
        {
            return ValidationService.validate( form, errorClass );
        }

	}, ['ValidationService']);
} (jQuery, PlentyFramework));