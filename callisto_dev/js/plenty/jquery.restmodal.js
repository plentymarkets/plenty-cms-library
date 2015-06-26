(function($){

    $.fn.prepareModal = function( options )
    {
        var modal = this;

        var defaults =
        {
            size:           null,
            classes:        '',
            showOnLoad:     true,
            contentURL:     '',
            contentLocation:'data.0',
            requestParams:  null,
            contentRequest:
                {
                    dataType:   'json',
                    type:       'GET',
                    onError:    function(jqXHR, status, thrownError) {
                                    console.log(jqXHR, status, thrownError);
                                }
                },
            afterRequest:   function(response) {},
            timeout:        false,
            afterTimeout:   function() {
                                modal.modal('hide');
                            },
            onDismiss:      function() {}

        };
        var config = $.extend(true, defaults, options);

        var reset = function()
        {
            modal.find('.modal-content').html('');

            if( !!config.size ) modal.find('.modal-dialog').removeClass('modal-'+config.size);

            if( !!config.timeout )
            {
                clearTimeout(timeout);
                clearInterval(interval);
            }
        };
        modal.on('hide.bs.modal', config.onDismiss);
        modal.on('hidden.bs.modal', reset);

        // prepare modal
        if( !!config.size ) modal.find('.modal-dialog').addClass('modal-'+config.size);

        modal.addClass( config.classes );

        // prepare content
        modal.addClass('loading');
        $.ajax(
            config.contentURL,
            {
                data:		JSON.stringify( config.requestParams ),
                dataType:	config.contentRequest.dataType,
                type:		config.contentRequest.type,
                success:    function( response )
                            {
                                var path = config.contentLocation.split('.');
                                var content = response;
                                $.each(
                                    path,
                                    function(i, step)
                                    {
                                        content = content[step];
                                    }
                                );

                                modal.find('.modal-content').html( content );
                                modal.find('.modal-content').bindPlentyFunctions();
                                modal.removeClass('loading');

                                config.afterRequest( response );

                                if( config.showOnLoad ) modal.modal('show');
                                if( !!config.timeout ) startTimeout();
                            },
                error:      config.contentRequest.onError
            }
        );

        //handle timeout
        if (!!config.timeout) {
            var timeout, interval;
            var timeRemaining, timeStart;
            var paused = false;

            var startTimeout = function () {
                timeRemaining = config.timeout;
                timeStart = (new Date()).getTime();

                timeout = setTimeout(function () {
                    config.afterTimeout(modal);
                    clearInterval(interval);
                }, config.timeout);

                modal.find('[data-plenty-modal="timer"]').text(timeRemaining / 1000);
                interval = setInterval(function () {
                    if (!paused) {
                        var secondsRemaining = timeRemaining - (new Date()).getTime() + timeStart;
                        secondsRemaining = Math.round(secondsRemaining / 1000);
                        modal.find('[data-plenty-modal="timer"]').text(secondsRemaining);
                    }
                }, 1000)
            };

            var pauseTimeout = function () {
                paused = true;
                timeRemaining -= (new Date()).getTime() - timeStart;
                clearTimeout(timeout);
            };

            var continueTimeout = function () {
                paused = false;
                timeStart = (new Date()).getTime();
                timeout = setTimeout(function () {
                    config.afterTimeout(modal);
                    clearInterval(interval);
                }, timeRemaining);
            };

            var stopTimeout = function () {
                clearTimeout( timeout );
                clearInterval( interval );
            };

            modal.on('hide.bs.modal', stopTimeout);
            modal.find('.modal-content').hover(pauseTimeout, function() {
                if( modal.is('.in') )
                {
                    continueTimeout();
                }
            });
        }

    };

}(jQuery));