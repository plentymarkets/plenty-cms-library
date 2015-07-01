(function($, pm) {

    // lazyload images (requires lazyload.min.js)
    // TODO: handle external dependencies dependencies
    pm.directive('img[data-plenty-lazyload]', function(i, elem) {
        $(elem).lazyload({
            effect: $(this).attr('data-plenty-lazyload')
        });
        $(elem).on("loaded", function() {
            $(elem).css('display', 'inline-block');
        });
    });

}(jQuery, PlentyFramework));