describe("AuthenticationService", function() {

    var AuthenticationService, ValidationService, CheckoutService;

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/test/helpers/fixtures/';
        jasmine.getFixtures().preload('lostPassword.html', 'customerLogin.html', 'customerRegistration.html');

        jasmine.Ajax.install();
        jasmine.addMatchers( customMatcher );

        PlentyFramework.compile();
        AuthenticationService = PlentyFramework.getInstance().AuthenticationService;
        ValidationService = PlentyFramework.getInstance().ValidationService;
        CheckoutService = PlentyFramework.getInstance().CheckoutService;

        spyOn( window.location, 'assign' );
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });


    describe("resetPassword()", function() {

        beforeEach(function() {
            loadFixtures('lostPassword.html');
            spyOn( ValidationService, 'validate' ).and.callThrough();
        });

        it("should validate the form", function() {

            $( 'button[type="submit"]' ).click();

            expect( ValidationService.validate ).toHaveBeenCalled();
            expect( AuthenticationService.resetPassword() ).toBeFalsy();

        });

        it("should send a request to server if form is valid", function() {

            $('#forgot-email' ).val('felix.dausch@plentymarkets.com');
            $( 'button[type="submit"]' ).click();

            expect( ValidationService.validate ).toHaveBeenCalled();
            expect( AuthenticationService.resetPassword() ).toBeTruthy();

            var request = jasmine.Ajax.requests.mostRecent();
            expect( request.url ).toBe( '/rest/checkout/lostpassword/' );
            expect( request.method ).toBe( 'POST' );
            expect( request.data() ).toEqual( {Email: 'felix.dausch@plentymarkets.com'} );

        });

        it("should display a message on success", function() {

            expect( $('[data-plenty-checkout="lostPasswordTextContainer"]') ).toBeVisible();
            expect( $('[data-plenty-checkout="lostPasswordSuccessMessage"]') ).toBeHidden();

            jasmine.Ajax.stubRequest('/rest/checkout/lostpassword/', null, 'POST' )
                .andReturn({
                    status: 200,
                    statusText: 'HTTP/1.1 200 OK',
                    contentType: 'application/json',
                    responseText: JSON.stringify(Responses.POST.checkout.lostPassword)
                });

            $('#forgot-email' ).val('felix.dausch@plentymarkets.com');
            $( 'button[type="submit"]' ).click();

            expect( $('[data-plenty-checkout="lostPasswordTextContainer"]') ).toBeHidden();
            expect( $('[data-plenty-checkout="lostPasswordSuccessMessage"]') ).toBeVisible();



        });

    });

    describe("customerLogin()", function() {

        beforeEach(function() {
            loadFixtures('customerLogin.html');
            spyOn( ValidationService, 'validate' ).and.callThrough();

        });

        it("should validate the form", function() {
            var login = AuthenticationService.customerLogin( $('[ data-plenty-checkout-form="customerLogin"]') );
            expect( ValidationService.validate ).toHaveBeenCalled();
            expect( login ).toBeFalsy();

        });

        it("should sent credentials to the server", function() {

            jasmine.Ajax.stubRequest('/rest/checkout/login/', null, 'POST' )
                .andReturn({
                    status: 200,
                    statusText: 'HTTP/1.1 200 OK',
                    contentType: 'application/json',
                    responseText: '{}'
                });

            $( 'input[name="loginMail"]' ).val( 'felix.dausch@plentymarkets.com' );
            $( 'input[name="loginPassword"]' ).val( 'myPassword' );

            var login = AuthenticationService.customerLogin( $('[ data-plenty-checkout-form="customerLogin"]') );
            expect( ValidationService.validate ).toHaveBeenCalled();
            expect( login ).toBeTruthy();
            expect( window.location.assign ).toHaveBeenCalledWith( $('[ data-plenty-checkout-form="customerLogin"]').attr('action') );


        });

    });

    describe("registerCustomer()", function() {

        beforeEach(function() {
            loadFixtures('customerRegistration.html');
            spyOn( ValidationService, 'validate' ).and.callThrough();
            spyOn( AuthenticationService, 'setInvoiceAddress' ).and.callThrough();
        });

        it("should validate the form", function() {

            $('button[type="submit"]').click();
            expect( ValidationService.validate ).toHaveBeenCalled();
            expect( AuthenticationService.setInvoiceAddress ).not.toHaveBeenCalled();

        });

        it("should send invoice address data to server", function() {

            $('input[name="Email"]' ).val( 'felix.dausch@plentymarkets.com' );
            $('input[name="EmailRepeat"]' ).val( 'felix.dausch@plentymarkets.com' );
            $('input[name="Password"]' ).val( 'myPassword' );
            $('input[name="PasswordRepeat"]' ).val( 'myPassword' );
            $('input[name="FirstName"]' ).val( 'Felix' );
            $('input[name="LastName"]' ).val( 'Dausch' );
            $('input[name="Street"]' ).val( 'Bürgermeister-Brunner-Str.' );
            $('input[name="HouseNo"]' ).val( '15' );
            $('input[name="ZIP"]' ).val( '34117' );
            $('input[name="City"]' ).val( 'Kassel' );

            $('button[type="submit"]').click();

            expect( ValidationService.validate ).toHaveBeenCalled();

            var request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({status: 200, responseText: '{}'});

            expect( request.url ).toBe('/rest/checkout/customerinvoiceaddress/' );
            expect( request.method ).toBe( 'POST' );

        });

        it("should redirect to forms action attribute", function() {

            $('input[name="Email"]' ).val( 'felix.dausch@plentymarkets.com' );
            $('input[name="EmailRepeat"]' ).val( 'felix.dausch@plentymarkets.com' );
            $('input[name="Password"]' ).val( 'myPassword' );
            $('input[name="PasswordRepeat"]' ).val( 'myPassword' );
            $('input[name="FirstName"]' ).val( 'Felix' );
            $('input[name="LastName"]' ).val( 'Dausch' );
            $('input[name="Street"]' ).val( 'Bürgermeister-Brunner-Str.' );
            $('input[name="HouseNo"]' ).val( '15' );
            $('input[name="ZIP"]' ).val( '34117' );
            $('input[name="City"]' ).val( 'Kassel' );

            $('button[type="submit"]').click();

            var request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({status: 200, responseText: '{}'});

            expect( window.location.assign ).toHaveBeenCalledWith( $('[data-plenty-checkout-form="customerRegistration"]').attr('action') );

        });

    });
});