(function($, pm) {

    /*
     * Social Share Activation
     * Activate and load share-buttons manually by clicking a separate button
     * Usage / data-attributes:
     * <div data-plenty-social="twitter">
     * 	<span data-plenty="switch"></span>				Will be used to activate the service set in data-plenty-social=""
     *		<span data-plenty="placeholder"></span>		Will be replaced with loaded share button
     * </div>
     *
     * possible values for data-plenty-social:
     * "facebook-like"			: Load Facebooks "Like"-Button
     * "facebook-recommend"		: Load Facebooks "Recommend"-Button
     * "twitter"				: Load Twitter Button
     * "google-plus"			: Load google "+1"-Button
     *
     * Additional Tooltips
     * You can extend the parent element with a (bootstrap) tooltip by adding data-toggle="tooltip" and title="TOOLTIP CONTENT"
     * Tooltip will be destroyed after activating a social service
     * (!) Requires bootstrap.js
     */
    pm.directive('[data-plenty-social]', function(i, elem, SocialShareProvider) {

        var toggle = $(elem).find('[data-plenty="switch"]');

        // append container to put / delete service.html
        $(elem).append('<div class="social-container"></div>');

        // add "off" class to switch, if neither "off" or "on" is set
        if ( !toggle.hasClass('off') && !toggle.hasClass('on') ) {
            toggle.addClass('off');
        }

        // toggle switch
        toggle.on('click', function() {
            if ( toggle.hasClass('off') ) {
                if ( $(elem).attr("data-toggle") == "tooltip" ) { $(elem).tooltip('destroy') };
                toggle.removeClass('off').addClass('on');
                // hide dummy button
                $(elem).find('[data-plenty="placeholder"]').hide();
                // load HTML defined in 'api'
                $(elem).find('.social-container').append( SocialShareProvider.getSocialService( $(elem).attr('data-plenty-social') ) );
            }
            // do not disable social medias after activation
            /*
             else
             {
             toggle.removeClass('on').addClass('off');
             // show dummy button
             $(elem).find('[data-plenty="placeholder"]').show();
             // remove api HTML
             $(elem).find('.social-container').html('');
             }
             */
        });
    }, ['SocialShareProvider']);

}(jQuery, PlentyFramework));