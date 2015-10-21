/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function($, pm) {

    /**
     * Provide templates for social share providers to inject them dynamically.
     * @class SocialShareService
     * @static
     */
    pm.service('SocialShareService', function() {

        //TODO: move to global variables
        if ( typeof(socialLangLocale) == 'undefined' ) socialLangLocale = 'en_US';
        if ( typeof(socialLang) == 'undefined' ) socialLang = 'en';

        return {
            getSocialService: getService
        };

        /**
         * Get the template for social media provider
         * @function getService
         * @param {string} identifier name of the social media provider to get the template for
         * @returns {string} the template to inject in DOM
         */
        function getService( identifier ) {
            var services = {
                'facebook-like' 	:	 '<iframe src="//www.facebook.com/plugins/like.php'
                +'?locale='+socialLangLocale
                +'&amp;href=' + encodeURIComponent(getURI())
                +'&amp;width=130'
                +'&amp;layout=button_count'
                +'&amp;action=like'
                +'&amp;show_faces=false'
                +'&amp;share=false'
                +'&amp;height=21'
                +'&amp;colorscheme=light" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:130px; height:21px;" allowTransparency="true"></iframe>',

                'facebook-recommend'	:	'<iframe src="//www.facebook.com/plugins/like.php'
                +'?locale='+socialLangLocale
                +'&amp;href=' + encodeURIComponent(getURI())
                +'&amp;width=130'
                +'&amp;layout=button_count'
                +'&amp;action=recommend'
                +'&amp;show_faces=false'
                +'&amp;share=false'
                +'&amp;height=21'
                +'&amp;colorscheme=light" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:130px; height:21px;" allowTransparency="true"></iframe>',

                'twitter'				: '<iframe src="//platform.twitter.com/widgets/tweet_button.html'
                +'?url=' + encodeURIComponent(getURI())
                +'&amp;text=' + getTweetText()
                +'&amp;count=horizontal'
                +'&amp;dnt=true" allowtransparency="true" frameborder="0" scrolling="no"  style="width:130px; height:21px;"></iframe>',

                'google-plus'			: '<div '
                +'class="g-plusone" '
                +'data-size="medium" '
                +'data-href="' + getURI() + '"></div>'
                +'<script type="text/javascript">window.___gcfg = {lang: "'+socialLang+'"}; (function() { var po = document.createElement("script"); po.type = "text/javascript"; po.async = true; po.src = "https://apis.google.com/js/platform.js"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(po, s); })(); </script>',
            };

            return services[identifier];
        }

        /**
         * get the canonical URL if defined
         * @function getURL
         * @private
         * @return {string} The Canonical URL if defined or the current URI
         */
        function getURI() {
            var uri = document.location.href;
            var canonical = $("link[rel=canonical]").attr("href");

            if (canonical && canonical.length > 0) {
                if (canonical.indexOf("http") < 0) {
                    canonical = document.location.protocol + "//" + document.location.host + canonical;
                }
                uri = canonical;
            }

            return uri;
        }

        /**
         * returns content of &lt;meta name="" content=""> tags or '' if empty/non existant
         * @function getMeta
         * @private
         * @param {string} name The meta name to get the value of;
         */
        function getMeta(name) {
            var metaContent = $('meta[name="' + name + '"]').attr('content');
            return metaContent || '';
        }

        /**
         * create tweet text from content of &lt;meta name="DC.title"> and &lt;meta name="DC.creator">
         * fallback to content of &lt;title> tag
         * @function getTweetText
         * @private
         */
        function getTweetText() {
            var title = getMeta('DC.title');
            var creator = getMeta('DC.creator');

            if (title.length > 0 && creator.length > 0) {
                title += ' - ' + creator;
            } else {
                title = $('title').text();
            }

            return encodeURIComponent(title);
        }

    });

}(jQuery, PlentyFramework));