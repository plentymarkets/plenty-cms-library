(function($, pm) {

    /*
     * Equal Box heights
     */
    pm.directive('[data-plenty-equal]', function(i, elem) {
        var mediaSizes = $(elem).data('plenty-equal').replace(/\s/g, '').split(',');

        var targets = ( $(elem).find('[data-plenty-equal-target]').length > 0 ) ? $(elem).find('[data-plenty-equal-target]') : $(elem).children();

        var maxHeight = 0;
        $(targets).each(function(j, child) {

            $(child).css('height', '');

            if( $(child).outerHeight(true) > maxHeight ) {
                maxHeight = $(child).outerHeight(true);
            }
        });

        if( !mediaSizes || $.inArray( window.mediaSize, mediaSizes ) >= 0 ) targets.height(maxHeight);

    }, [], true);

    // refresh calculation on window resize
    $(window).on('sizeChange', function() {
        pm.getInstance().bindDirectives( '[data-plenty-equal]' );
    });

}(jQuery, PlentyFramework));