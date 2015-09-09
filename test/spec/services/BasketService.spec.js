describe( "BasketService", function() {

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

    describe( "addBasketItem()", function() {

        it("should add a list of items to the basket", function() {

        });

        it("should show a popup for item params if 'BAD REQUEST' is returned", function() {

        });

        it("should print any other errors", function() {

        });

    });

});