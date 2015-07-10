(function($, pm) {

    // link non-anchor elements
    pm.directive('a[data-plenty-href]', function(i, elem, MediaSizeService) {
        $(elem).each(function() {
            var href = $(this).attr('href');
            var identifier = $(this).attr('data-plenty-href');

            $('[data-plenty-link="'+identifier+'"]').click(function() {
                if( MediaSizeService.interval() != 'xs' ) {
                    window.location.href = href;
                }
            });
        });
    }, ['MediaSizeService']);

}(jQuery, PlentyFramework));