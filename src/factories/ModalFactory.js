/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Factories
 */
(function($, pm) {

    /**
     * Provides methods for creating and displaying modal popups.
     * @class ModalFactory
     * @static
     */
	pm.factory('ModalFactory', function() {

		return {
            prepare: prepare,
            isModal: isModal
		};

        /**
         * Detect if given html contains a valid modal
         * @function isModal
         * @param {string} html
         * @returns {boolean}
         */
        function isModal( html ) {
            return $(html).filter('.modal' ).length + $(html).find('.modal' ).length > 0;
        }

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
         * @for ModalFactory
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
             * Callback when modal is confirmed by clicking confirmation button.
             * Modal will not be dismissed if callback returns false.
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
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/content:attribute}}content{{/crossLink}} of the modal
             * @function setContent
             * @param   {string}    content The content
             * @returns {Modal}     Modal object for chaining methods
             */
            function setContent( content ) {
                modal.content = content;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/labelConfirm:attribute}}label of the confirmation button{{/crossLink}} of the modal
             * @function setLabelConfirm
             * @param   {string}    label The label
             * @returns {Modal}     Modal object for chaining methods
             */
            function setLabelConfirm( label ) {
                modal.labelConfirm = label;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/labelDismiss:attribute}}label if the dismiss button{{/crossLink}} of the modal
             * @function setLabelDismiss
             * @param   {string}    label The label
             * @returns {Modal}     Modal object for chaining methods
             */
            function setLabelDismiss( label ) {
                modal.labelDismiss = label;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/onConfirm:attribute}}confirmation callback{{/crossLink}} of the modal
             * @function onConfirm
             * @param   {function}  callback The callback if modal is confirmed
             * @returns {Modal}     Modal object for chaining methods
             */
            function onConfirm( callback ) {
                modal.onConfirm = callback;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/onDismiss:attribute}}dismiss callback{{/crossLink}} of the modal
             * @function onDismiss
             * @param   {function}  callback The callback if modal is dismissed
             * @returns {Modal}     Modal object for chaining methods
             */
            function onDismiss( callback ) {
                modal.onDismiss = callback;
                return this;
            }



            /**
             * Set the {{#crossLink "ModalFactory.Modal/container:attribute}}container{{/crossLink}} of the modal
             * @function setContainer
             * @param   {string}    container The jQuery selector of the container to display the modal in
             * @returns {Modal}     Modal object for chaining methods
             */
            function setContainer( container ) {
                modal.container = container;
                return this;
            }

            /**
             * Set the {{#crossLink "ModalFactory.Modal/timeout:attribute}}timeout{{/crossLink}} of the modal
             * @function setTimeout
             * @param   {number}    timeout The timeout to close the modal automatically. Set &lt;0 to disable
             * @returns {Modal}     Modal object for chaining methods
             */
            function setTimeout( timeout ) {
                modal.timeout = timeout;
                return this;
            }

            /**
             * Inject modal data in default template if not template is given
             * and display the modal inside the configured container.<br>
             * Start timer to hide the modal automatically if timeout is set.
             * @function show
             */
            function show() {
                if( isModal( modal.content ) ) {
                    bsModal = $(modal.content);
                    if( bsModal.length > 1 || !bsModal.is('.modal') ) {
                        bsModal = $(modal.content).filter('.modal') || $(modal.content).find('.modal');
                    }
                } else {
                    bsModal = $( buildTemplate() );
                }

                $(modal.container).append( bsModal );

                // append additional scripts executable
                var scripts = $(modal.content).filter('script');
                if( scripts.length > 0 ) {
                    scripts.each(function( i, script ) {
                        var element = document.createElement('script');
                        element.type = 'text/javascript';
                        element.innerHTML = $(script).text();
                        $( modal.container ).append( element );
                    });
                }

                // bind callback functions
                bsModal.on('hidden.bs.modal', function() {
                    hide();
                });
                bsModal.find('[data-plenty-modal="confirm"]').click( function() {
                    var close = modal.onConfirm();
                    if( close ) hide(true);
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
             * Wrap html content in bootstrap styled modal.
             * @function buildTemplate
             * @private
             * @returns {string}
             */
            function buildTemplate() {

                var template = '<div class="modal fade"> \
                                    <div class="modal-dialog"> \
                                        <div class="modal-content">';

                if( !!modal.title && modal.title.length > 0 ) {
                    template +=             '<div class="modal-header"> \
                                                <button class="close" type="button" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button> \
                                                <h4 class="modal-title">' + modal.title + '</h4> \
                                            </div>';
                }

                template +=                 '<div class="modal-body">' + modal.content + '</div> \
                                             <div class="modal-footer">';

                if( !!modal.labelDismiss && modal.labelDismiss.length > 0 ) {
                    template +=                '<button type="button" class="btn btn-default" data-dismiss="modal"> \
                                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' + modal.labelDismiss + '  \
                                                </button>';
                }

                template +=                    '<button type="button" class="btn btn-primary" data-dismiss="modal" data-plenty-modal="confirm"> \
                                                    <span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' + modal.labelConfirm + ' \
                                                </button> \
                                            </div> \
                                        </div> \
                                    </div> \
                                </div>';

                return template;
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