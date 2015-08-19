describe("CMSFactory", function() {

    var CMSFactory, APIFactory;

    beforeEach(function() {

        jasmine.addMatchers( customMatcher );

        PlentyFramework.compile();
        CMSFactory = PlentyFramework.factories.CMSFactory;
        APIFactory = PlentyFramework.factories.APIFactory;
        spyOn( APIFactory, 'get' );
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

    describe("CMSFactory.getContainer()", function() {

        it("provides a single function to specify the layout group", function() {


            expect( CMSFactory.getContainer ).toBeFunction();
            expect( CMSFactory.getContainer().from ).toBeFunction();
            expect( Object.keys( CMSFactory.getContainer() ).length ).toBe( 1 );

        });

        it("is a shorthand method for APIFactory.get()", function() {

            CMSFactory.getContainer('Totals').from('Checkout');
            expect( APIFactory.get ).toHaveBeenCalled();

        });

    });

    describe("CMSFactory.getParams()", function() {

        it("provides a single function to specify the layout group", function() {


            expect( CMSFactory.getParams ).toBeFunction();
            expect( CMSFactory.getParams().from ).toBeFunction();
            expect( Object.keys( CMSFactory.getParams() ).length ).toBe( 1 );

        });

        it("is a shorthand method for APIFactory.get()", function() {

            CMSFactory.getParams('BasketItemsList').from('Checkout');

            expect( APIFactory.get ).toHaveBeenCalled();

        });

    });

    describe("CMSFactory.getCategoryContent()", function() {

        it("is a shorthand method for APIFactory.get()", function() {

            CMSFactory.getCategoryContent(123);

            expect( APIFactory.get ).toHaveBeenCalled();

        });

    });

});