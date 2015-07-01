(function($, pm) {

    // Tree navigation toggle
    pm.directive('[data-plenty="openCloseToggle"]', function(i, elem) {
        $(elem).click(function () {
            $(elem).parent().addClass('animating');
            $(elem).siblings('ul').slideToggle(200, function () {
                if ($(elem).parent().is('.open')) {
                    $(elem).parent().removeClass('open');
                }
                else {
                    $(elem).parent().addClass('open');
                }
                $(elem).removeAttr('style');
                $(elem).parent().removeClass('animating');
            });
        });

    });

}(jQuery, PlentyFramework));