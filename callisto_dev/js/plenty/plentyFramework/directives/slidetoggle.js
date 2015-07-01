(function($, pm) {

    // Toggle target content on click.
    // Can be bound on checked-/ unchecked-property of radio buttons
    pm.directive('[data-plenty-slidetoggle]', function(i, elem) {

        $(elem).each(function( i, trigger ) {
            var target = $( $(this).attr('data-plenty-target') );
            if ( $(trigger)[0].tagName.toLowerCase() == 'input' && $(trigger).attr('type').toLowerCase() == 'radio' ) {
                // is radio button
                var radioList = $('input[type="radio"][name="'+( $(trigger).attr('name') )+'"]');
                var visibleOnChecked = $(trigger).is('[data-plenty-slidetoggle="unchecked"]');
                $(radioList).change(function() {
                    $(target).parents('[data-plenty-equal-target]').css('height', 'auto');

                    if ( $(this).is(':checked') && $(this)[0] === $(trigger)[0] ) {
                        // checked
                        if ( visibleOnChecked == true ) {
                            $(target).slideDown(400, function() {
                                pm.getInstance().bindDirectives('[data-plenty-equal]');
                            });
                        } else {
                            $(target).slideUp(400, function() {
                                pm.getInstance().bindDirectives('[data-plenty-equal]');
                            });
                        }
                    }
                    else {
                        // unchecked (since other radio button has been checked)
                        if ( visibleOnChecked == true ) {
                            $(target).slideUp(400, function() {
                                pm.getInstance().bindDirectives('[data-plenty-equal]');
                            });
                        } else {
                            $(target).slideDown(400, function() {
                                pm.getInstance().bindDirectives('[data-plenty-equal]');
                            });
                        }
                    }
                });
            }
            else {
                // is not radio button
                $(trigger).click(function() {
                    $(target).parents('[data-plenty-equal-target]').css('height', 'auto');

                    $(trigger).addClass('animating');
                    $(target).slideToggle(400, function() {
                        $(trigger).removeClass('animating');
                        $(trigger).toggleClass('active');
                        pm.getInstance().bindDirectives('[data-plenty-equal]');
                    });
                });
            }
        });
    });

}(jQuery, PlentyFramework));