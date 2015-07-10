(function($, pm) {

	pm.factory('ModalFactory', function() {

		return {
            prepare: prepare
		};

        function Modal() {

            var modal = this;
            modal.title      = '';
            modal.content    = '';
            modal.labelDismiss = 'Abbrechen';
            modal.labelConfirm = 'Bestätigen';
            modal.onConfirm  = function() {};
            modal.onDismiss  = function() {};
            modal.container  = 'body';
            modal.template;
            modal.timeout = -1;

            var bsModal;
            var timeout, interval;
            var timeRemaining, timeStart;
            var paused = false;

            return {
                setTitle: setTitle,
                setContent: setContent,
                setContainer: setContainer,
                setLabelConfirm: setLabelConfirm,
                setLabelDismiss: setLabelDismiss,
                onConfirm: onConfirm,
                onDismiss: onDismiss,
                setTemplate: setTemplate,
                setTimeout: setTimeout,
                show: show,
                hide: hide
            };

            function setTitle( title ) {
                modal.title = title;
                return this;
            }

            function setContent( content ) {
                modal.content = content;
                return this;
            }

            function setLabelConfirm( label ) {
                modal.labelConfirm = label;
                return this;
            }

            function setLabelDismiss( label ) {
                modal.labelDismiss = label;
                return this;
            }

            function onConfirm( callback ) {
                modal.onConfirm = callback;
                return this;
            }

            function onDismiss( callback ) {
                modal.onDismiss = callback;
                return this;
            }

            function setContainer( container ) {
                modal.container = container;
                return this;
            }

            function setTemplate( template ) {
                modal.template = template;
                return this;
            }

            function setTimeout( timeout ) {
                modal.timeout = timeout;
                return this;
            }

            function show() {

                if( !modal.template ) {
                    modal.template =    '<div class="modal fade"> \
                                            <div class="modal-dialog"> \
                                                <div class="modal-content"> \
                                                    <div class="modal-header"> \
                                                        <button class="close" type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> \
                                                        <h4 class="modal-title">' + modal.title + '</h4> \
                                                    </div> \
                                                    <div class="modal-body">' + modal.content + '</div> \
                                                    <div class="modal-footer"> \
                                                        <button type="button" class="btn btn-default" data-dismiss="modal"> \
                                                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' + modal.labelDismiss + '  \
                                                        </button> \
                                                        <button type="button" class="btn btn-primary" data-dismiss="modal" data-plenty-modal="confirm"> \
                                                            <span class="glyphicon glyphicon-trash" aria-hidden="true"></span> ' + modal.labelConfirm + ' \
                                                        </button> \
                                                    </div> \
                                                </div> \
                                            </div> \
                                        </div>';
                }

                // inject modal in DOM
                bsModal = $(modal.template);

                if( bsModal.length > 1 ) {
                    bsModal = $(modal.template).nextAll('.modal') || $(modal.template).find('.modal');
                }

                $(modal.container).append( bsModal );

                // bind callback functions
                bsModal.on('hidden.bs.modal', function() {
                    hide();
                });
                bsModal.find('[data-plenty-modal="confirm"]').click( function() {
                    modal.onConfirm();
                    hide(true);
                });

                bsModal.modal('show');

                bsModal.on('hidden.bs.modal', function() {
                    bsModal.remove();
                });

                if( modal.timeout > 0 ) {
                    startTimeout();
                    bsModal.on('hide.bs.modal', stopTimeout);
                    bsModal.find('.modal-content').hover(pauseTimeout, function() {
                        if( bsModal.is('.in') )
                        {
                            continueTimeout();
                        }
                    });
                }

            }

            function hide( confirmed ) {
                bsModal.modal('hide');

                if( !confirmed ) {
                    modal.onDismiss();
                }
            }

            function startTimeout() {
                timeRemaining = modal.timeout;
                timeStart = (new Date()).getTime();

                timeout = window.setTimeout(function () {
                    window.clearInterval(interval);
                    hide();
                }, modal.timeout);

                bsModal.find('[data-plenty-modal="timer"]').text(timeRemaining / 1000);
                interval = window.setInterval(function () {
                    if (!paused) {
                        var secondsRemaining = timeRemaining - (new Date()).getTime() + timeStart;
                        secondsRemaining = Math.round(secondsRemaining / 1000);
                        bsModal.find('[data-plenty-modal="timer"]').text(secondsRemaining);
                    }
                }, 1000)
            }

            function pauseTimeout() {
                paused = true;
                timeRemaining -= (new Date()).getTime() - timeStart;
                window.clearTimeout(timeout);
            }

            function continueTimeout() {
                paused = false;
                timeStart = (new Date()).getTime();
                timeout = window.setTimeout(function () {
                    hide();
                    window.clearInterval(interval);
                }, timeRemaining);
            }

            function stopTimeout() {
                window.clearTimeout( timeout );
                window.clearInterval( interval );
            }

        }

        function prepare() {
            return new Modal();
        }




	});
}(jQuery, PlentyFramework));