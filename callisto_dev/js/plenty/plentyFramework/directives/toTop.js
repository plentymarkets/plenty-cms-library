(function($, pm) {

    pm.directive('[data-plenty="toTop"]', function(i, elem) {
        $(elem).click(function() {
            $('html, body').animate({
                scrollTop: 0
            }, 400);
            return false;
        });
    });

}(jQuery, PlentyFramework));