(function(pm){

    pm.service('MediaSize', function() {

        var bsInterval;

        function getInterval() {
            if( !!bsInterval ) calculateMediaSize();

            return bsInterval;
        }

        function calculateMediaSize() {
            var size;
            if( !!window.matchMedia ) { // FIX IE support
                if( window.matchMedia('(min-width:1200px)').matches ) size = 'lg';
                else if( window.matchMedia('(min-width:992px)').matches ) size = 'md';
                else if( window.matchMedia('(min-width:768px)').matches ) size = 'sm';
                else size = 'xs';
            } else {
                if( $(window).width() >= 1200 ) size = 'lg';
                else if( $(window).width() >= 992 ) size = 'md';
                else if( $(window).width() >= 768 ) size = 'sm';
                else size = 'xs';
            }
            if( size != bsInterval ) {
                bsInterval = size;
                $(window).trigger('sizeChange');
            }
        }


        $(window).resize( calculateMediaSize );
        $(document).ready( calculateMediaSize );


        return {
            interval: getInterval
        };

    });

}(PlentyFramework));