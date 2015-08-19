describe("UIFactory", function() {

    var UIFactory;
    var ErrorPane;

    beforeEach( function() {
        jasmine.addMatchers( customMatcher );

        PlentyFramework.compile();
        UIFactory = PlentyFramework.factories['UIFactory'];
        $('body').html('');
        UIFactory.hideWaitScreen(true);
    });

    it("should display new errors", function() {

        var error = {
            code: 1,
            message: 'Error'
        };

        UIFactory.printErrors( [error] );
        expect( $('#CheckoutErrorPane') ).toContainElement( '.plentyErrorBoxContent' );
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent').length ).toBe( 1 );
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent .PlentyErrorCode') ).toContainText('1');
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent .PlentyErrorMsg') ).toContainText('Error');

        var error2 = {
            code: 2,
            message: 'Another error'
        };

        UIFactory.printErrors( [error2] );
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent').length ).toBe( 2 );
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent .PlentyErrorCode' ).eq(1) ).toContainText('2');
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent .PlentyErrorMsg' ).eq(1) ).toContainText('Another error');


        UIFactory.throwError( 3, 'Last error');
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent').length ).toBe( 3 );
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent .PlentyErrorCode' ).eq(2) ).toContainText('3');
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent .PlentyErrorMsg' ).eq(2) ).toContainText('Last error');

    });

    it("should not display an error occurred before", function() {

        var error = {
            code: 1,
            message: 'Error'
        };

        UIFactory.printErrors( [error] );
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent').length ).toBe( 1 );

        UIFactory.printErrors( [error] );
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent').length ).not.toBe( 2 );
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent').length ).toBe( 1 );

    });

    it("should build and inject an error popup if not exists", function() {

        $('body').html('');

        expect( $('body') ).not.toContainElement('#CheckoutErrorPane');

        UIFactory.throwError( 1, 'Error msg' );
        expect( $('body') ).toContainElement('#CheckoutErrorPane');

        UIFactory.throwError( 2, 'New error msg');
        expect( $('.plentyErrorBox').length ).not.toBe( 2 );
        expect( $('.plentyErrorBox').length ).toBe( 1 );
    });

    it("should clear errors if popup is closed", function() {

        UIFactory.throwError( 1, 'Error msg' );

        $('#CheckoutErrorPane .close').click();

        UIFactory.throwError( 2, 'New error msg' );

        expect( $('#CheckoutErrorPane .plentyErrorBoxContent').length ).not.toBe( 2 );
        expect( $('#CheckoutErrorPane .plentyErrorBoxContent').length ).toBe( 1 );

    });

    it("should show a waitscreen", function() {

        expect( $('body') ).not.toContainElement( '#PlentyWaitScreen' );

        UIFactory.showWaitScreen();

        expect( $('body') ).toContainElement( '#PlentyWaitScreen' );

    });

    it("should hide the waitscreen", function() {

        UIFactory.showWaitScreen();

        expect( $('body') ).toContainElement( '#PlentyWaitScreen' );
        expect( $('#PlentyWaitScreen') ).toHaveClass('in');

        UIFactory.hideWaitScreen();
        expect( $('#PlentyWaitScreen') ).not.toHaveClass('in');

    });

    it("should count the instances of wait screens", function() {

        var count;

        count = UIFactory.showWaitScreen();

        expect( count ).toBe( 1 );
        expect( $('#PlentyWaitScreen') ).toHaveClass('in');

        count = UIFactory.showWaitScreen();

        expect( count ).toBe( 2 );
        expect( $('#PlentyWaitScreen') ).toHaveClass('in');

        count = UIFactory.hideWaitScreen();

        expect( count ).toBe( 1 );
        expect( $('#PlentyWaitScreen') ).toHaveClass('in');

        count = UIFactory.hideWaitScreen();

        expect( count ).toBe( 0 );
        expect( $('#PlentyWaitScreen') ).not.toHaveClass('in');


    });

    it("should close all instances of waitscreens if forced", function() {

        var count;

        count = UIFactory.showWaitScreen();
        count = UIFactory.showWaitScreen();
        count = UIFactory.showWaitScreen();

        expect( count ).toBe( 3 );

        count = UIFactory.hideWaitScreen(true);
        expect( count ).toBe( 0 );
        expect( $('#PlentyWaitScreen') ).not.toHaveClass('in');

    });
});