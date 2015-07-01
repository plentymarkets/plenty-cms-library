(function($, pm) {

    // link non-anchor elements
    pm.directive('a[data-plenty-href]', function(elem) {
        $(elem).each(function() {
            var href = $(this).attr('href');
            var identifier = $(this).attr('data-plenty-href');

            $('[data-plenty-link="'+identifier+'"]').click(function() {
                if( window.mediaSize != 'xs' ) {
                    window.location.href = href;
                }
            });
        });
    });

}(jQuery, PlentyFramework));