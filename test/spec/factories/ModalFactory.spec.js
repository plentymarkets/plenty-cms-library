describe("ModalFactory", function() {

    var ModalFactory;

    beforeEach(function() {

        jasmine.addMatchers( customMatcher );

        PlentyFramework.compile();
        ModalFactory = PlentyFramework.factories.ModalFactory;
        $.support.transition = false;

    });

    it("Provides a method for creating a new modal", function() {

        expect( ModalFactory.prepare ).toBeFunction();

        var modal1 = ModalFactory.prepare();
        var modal2 = ModalFactory.prepare();

        expect( modal1 ).not.toEqual( modal2 );

    });

    describe("Modal", function() {

        var modal;

        beforeEach(function() {
            jasmine.clock().install();
            modal = ModalFactory.prepare();
            $('body').html('');
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it("can get displayed", function() {

            expect( $('body') ).not.toContainElement( $('.modal') );

            modal.show();

            expect( $('body') ).toContainElement( $('.modal') );
            expect( $('.modal') ).toBeVisible();

        });

        it("can be injected in specified container", function() {

            setFixtures('<div id="modalContainer"></div>');

            expect( $('body') ).not.toContainElement( $('.modal') );
            expect( $('#modalConainer') ).not.toContainElement( $('.modal') );

            modal.setContainer('#modalContainer' ).show();

            expect( $('body > .modal') ).not.toExist();
            expect( $('#modalContainer') ).toContainElement( $('.modal') );

        });

        it("can get be customized", function() {

            modal
                .setTitle( 'Test Modal' )
                .setContent( 'Hello World' )
                .setLabelConfirm('OK')
                .setLabelDismiss('Cancel')
                .show();

            expect( $('.modal-title') ).toHaveText( 'Test Modal' );
            expect( $('.modal-body') ).toHaveText( 'Hello World' );
            expect( $('.btn-default') ).toHaveText( 'Cancel' );
            expect( $('.btn-primary') ).toHaveText( 'OK' );

        });

        it("can call custom callbacks on dismiss and on confirm", function() {

            var dismissFn = jasmine.createSpy();
            var confirmFn = jasmine.createSpy();

            modal
                .onDismiss( dismissFn )
                .onConfirm( confirmFn )
                .show();

            $('.modal .btn-default' ).click();
            expect( $('.modal' ) ).not.toExist();
            expect( dismissFn ).toHaveBeenCalled();


            modal.show();
            $('.modal .btn-primary' ).click();
            expect( $('.modal' ) ).not.toExist();
            expect( confirmFn ).toHaveBeenCalled();

        });

        it("can be closed automically after timeout", function() {

            modal.setTimeout( 5000 ).show();
            expect( $('.modal') ).toBeVisible();

            jasmine.clock().tick(2500);
            expect( $('.modal') ).toBeVisible();

            jasmine.clock().tick(2501);
            expect( $('.modal' ) ).not.toExist();

        });

        it("can pause timeout on hover", function() {

            modal.setTimeout( 5000 ).show();

            $('.modal').find('.modal-content').trigger('mouseenter');
            jasmine.clock().tick(7500);
            expect( $('.modal' ) ).toBeVisible();

            $('.modal').find('.modal-content').trigger('mouseleave');
            jasmine.clock().tick(5001);
            expect( $('.modal' ) ).not.toExist();


        });

        it("can detect bootstrap styled modals", function() {

            expect( ModalFactory.isModal('<div class="modal"></div>') ).toBe( true );
            expect( ModalFactory.isModal('<div class="anything"></div>') ).toBe( false );
            expect( ModalFactory.isModal('<div class="modal"></div><div class="some-sibling"></div>') ).toBe( true );
            expect( ModalFactory.isModal('<div id="wrapper"><div class="modal"></div></div>' ) ).toBe( true );

        });

        it("can execute JavaScript loaded with Modal's content", function() {

            window.loadedFn = jasmine.createSpy();

            var content = '<div class="modal"></div><script>loadedFn()</script>';
            modal.setContent( content ).show();

            expect( loadedFn ).toHaveBeenCalled();

        });
    });

});