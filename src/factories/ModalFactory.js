(function($, pm) {

    /**
     * Provides methods for creating and displaying modal popups.
     * @module Factories
     * @class ModalFactory
     * @static
     */
	pm.factory('ModalFactory', function() {

		return {
            prepare: prepare
		};

        /**
         * Create a new Instance of {{#crossLink "ModalFactory.Modal"}}Modal{{/crossLink}}
         * @function prepare
         * @returns {Modal}
         */
        function prepare() {
            return new Modal();
        }

        /**
         * Holds configuration of a modal and provides methods for displaying and hiding the modal
         * @class Modal
         * @namespace ModalFactory
         * @returns {Modal}
         * @constructor
         */
        function Modal() {

            var modal = this;
            /**
             * The title of the modal
             * @attribute title
             * @type {string}
             * @private
             * @default ""
             */
            modal.title      = '';

            /**
             * The content of the modal
             * @attribute content
             * @type {string}
             * @private
             * @default ""
             */
            modal.content    = '';

            /**
             * The content of the dismiss-button
             * @attribute labelDismiss
             * @type {string}
             * @private
             * @default "Abbrechen"
             */
            modal.labelDismiss = 'Abbrechen';

            /**
             * the label of the confirmation button
             * @attribute labelConfirm
             * @type {string}
             * @private
             * @default "Bestätigen"
             */
            modal.labelConfirm = 'Bestätigen';

            /**
             * Callback when modal is confirmed by clicking confirmation button
             * @attribute onConfirm
             * @type {function}
             * @private
             * @default function() {}
             */
            modal.onConfirm  = function() {};

            /**
             * Callback when modal is dismissed by closing the modal
             * @attribute onDismiss
             * @type {function}
             * @private
             * @default function() {}
             */
            modal.onDismiss  = function() {};

            /**
             * jQuery selector of the container element to display the modal in.
             * @attribute container
             * @type {string}
             * @private
             * @default "body"
             */
            modal.container  = 'body';

            /**
             * external html template to use for this modal.<br>
             * Modals {{#crossLink "ModalFactory.Modal/title:attribute"}}title{{/crossLink}},
             * {{#crossLink "ModalFactory.Modal/content:attribute"}}content{{/crossLink}} and
             * {{#crossLink "ModalFactory.Modal/labelConfirm:attribute"}}button labels{{/crossLink}} will not be injected.
             * {{#crossLink "ModalFactory.Modal/onDismiss:attribute"}}Callback methods{{/crossLink}} will be bound on modal.
             * To bind {{#crossLink "ModalFactory.Modal/onConfirm"}}confirmation callback{{/crossLink}},
             * mark elements with <b>data-plenty-modal="confirm"</b>
             * @attribute template
             * @type {string}
             * @private
             * @default ""
             */
            modal.template   = '';

            /**
             * Timeout to close the modal automatically. Set &lt;0 to disable.
             * @attribute timeout
             * @type {number}
             * @private
             * @default -1
             */
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

            /**
             * Set the {{#crossLink "ModalFactory.Modal/title:attribute}}title{{/crossLink}} of the modal
             * @function setTitle
             * @param   {string}    title The title
             * @returns {Modal}     Modal object for chaining methods
             */
            function setTitle( title ) {
                modal.title = title;
                return modal;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/content:attribute}}content{{/crossLink}} of the modal
             * @function setContent
             * @param   {string}    content The content
             * @returns {Modal}     Modal object for chaining methods
             */
            function setContent( content ) {
                modal.content = content;
                return modal;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/labelConfirm:attribute}}label of the confirmation button{{/crossLink}} of the modal
             * @function setLabelConfirm
             * @param   {string}    label The label
             * @returns {Modal}     Modal object for chaining methods
             */
            function setLabelConfirm( label ) {
                modal.labelConfirm = label;
                return modal;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/labelDismiss:attribute}}label if the dismiss button{{/crossLink}} of the modal
             * @function setLabelDismiss
             * @param   {string}    label The label
             * @returns {Modal}     Modal object for chaining methods
             */
            function setLabelDismiss( label ) {
                modal.labelDismiss = label;
                return modal;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/onConfirm:attribute}}confirmation callback{{/crossLink}} of the modal
             * @function onConfirm
             * @param   {function}  callback The callback if modal is confirmed
             * @returns {Modal}     Modal object for chaining methods
             */
            function onConfirm( callback ) {
                modal.onConfirm = callback;
                return modal;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/onDismiss:attribute}}dismiss callback{{/crossLink}} of the modal
             * @function onDismiss
             * @param   {function}  callback The callback if modal is dismissed
             * @returns {Modal}     Modal object for chaining methods
             */
            function onDismiss( callback ) {
                modal.onDismiss = callback;
                return modal;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/container:attribute}}container{{/crossLink}} of the modal
             * @function setContainer
             * @param   {string}    container The jQuery selector of the container to display the modal in
             * @returns {Modal}     Modal object for chaining methods
             */
            function setContainer( container ) {
                modal.container = container;
                return modal;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/template:attribute}}template{{/crossLink}} of the modal
             * @function setTemplate
             * @param   {string}    template The template to use for the modal
             * @returns {Modal}     Modal object for chaining methods
             */
            function setTemplate( template ) {
                modal.template = template;
                return modal;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/timeout:attribute}}timeout{{/crossLink}} of the modal
             * @function setTimeout
             * @param   {number}    timeout The timeout to close the modal automatically. Set &lt;0 to disable
             * @returns {Modal}     Modal object for chaining methods
             */
            function setTimeout( timeout ) {
                modal.timeout = timeout;
                return modal;
            }

            /**
             * Inject modal data in default template if not template is given
             * and display the modal inside the configured container.<br>
             * Start timer to hide the modal automatically if timeout is set.
             * @function show
             */
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

            /**
             * Hide the modal.
             * @function hide
             * @param {boolean} confirmed Flag indicating of modal is closed by confirmation button or dismissed
             */
            function hide( confirmed ) {
                bsModal.modal('hide');

                if( !confirmed ) {
                    modal.onDismiss();
                }
            }

            /**
             * Start the configured timeout initially
             * @function startTimeout
             * @private
             */
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

            /**
             * Pause the timeout (e.g. on hover)
             * @function pauseTimeout
             * @private
             */
            function pauseTimeout() {
                paused = true;
                timeRemaining -= (new Date()).getTime() - timeStart;
                window.clearTimeout(timeout);
            }

            /**
             * Continue paused timeout
             * @function continueTimeout
             * @private
             */
            function continueTimeout() {
                paused = false;
                timeStart = (new Date()).getTime();
                timeout = window.setTimeout(function () {
                    hide();
                    window.clearInterval(interval);
                }, timeRemaining);
            }

            /**
             * Stop timeout. Stopped timeouts cannot be continued.
             * @function stopTimeout
             * @private
             */
            function stopTimeout() {
                window.clearTimeout( timeout );
                window.clearInterval( interval );
            }

        }




	});
}(jQuery, PlentyFramework));