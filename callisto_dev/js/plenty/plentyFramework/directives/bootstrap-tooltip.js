(function($, pm) {

    // append Bootstrap Tooltip
    pm.directive('[data-toggle="tooltip"]', function(i, elem) {
        $(elem).tooltip({
            container: 'body'
        });
    });

}(jQuery, PlentyFramework));