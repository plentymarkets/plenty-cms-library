describe("CheckoutFactory", function() {

    var CheckoutFactory;

    beforeEach(function() {

        jasmine.addMatchers( customMatcher );
        jasmine.Ajax.install();
        jasmine.Ajax.stubRequest('/rest/checkout/', null, 'GET' )
            .andReturn({
                status: 200,
                statusText: 'HTTP/1.1 200 OK',
                contentType: 'text/html',
                responseText: JSON.stringify(Responses.GET.checkout)
            });

        PlentyFramework.compile();
        CheckoutFactory = PlentyFramework.factories['CheckoutFactory'];

    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

    it("should provide global checkout functions", function() {

        expect( CheckoutFactory.getCheckout ).toBeFunction();
        expect( CheckoutFactory.setCheckout ).toBeFunction();
        expect( CheckoutFactory.loadCheckout ).toBeFunction();

    });

    it("should receive checkout data from API", function() {

        expect( CheckoutFactory.getCheckout() ).toBeDefined();
        expect( Object.keys(CheckoutFactory.getCheckout()).length ).toBe( 0 );

        CheckoutFactory.loadCheckout();

        expect( CheckoutFactory.getCheckout() ).toEqual( Responses.GET.checkout.data );

    });

    it("should store changes on checkout data globally", function() {

        CheckoutFactory.loadCheckout();
        var MethodOfPaymentID = CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID;

        CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID += 1;

        expect( CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID ).not.toBe( MethodOfPaymentID );
        expect( CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID ).toBe( MethodOfPaymentID+1 );

    });

    it("should be able to save checkout data on server", function() {

        CheckoutFactory.loadCheckout();
        var MethodOfPaymentID = CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID;

        CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID += 1;

        // loading checkout without putting modified data to server will override local changes
        CheckoutFactory.loadCheckout();
        expect( CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID ).toBe( MethodOfPaymentID );
        expect( CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID ).not.toBe( MethodOfPaymentID + 1 );

        CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID += 1;
        CheckoutFactory.setCheckout();
        expect( CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID ).not.toBe( MethodOfPaymentID );
        expect( CheckoutFactory.getCheckout().CheckoutMethodOfPaymentID ).toBe( MethodOfPaymentID + 1 );

    });

    describe("CheckoutFactory.reloadContainer() ", function() {

        var UIFactory, CMSFactory;
        var testDirective;

        beforeEach(function() {
            UIFactory = PlentyFramework.factories.UIFactory;
            CMSFactory = PlentyFramework.factories.CMSFactory;

            spyOn( UIFactory, 'showWaitScreen').and.callThrough();
            spyOn( UIFactory, 'hideWaitScreen').and.callThrough();
            spyOn( CMSFactory, 'getContainer').and.callThrough();

            jasmine.Ajax.stubRequest('/rest/checkout/container_checkouttotals/')
                .andReturn({
                    status: 200,
                    statusText: 'HTTP/1.1 200 OK',
                    contentType: 'text/html',
                    responseText: JSON.stringify(Responses.GET.container_totals)
                });

            testDirective = PlentyFramework.directive('[data-test]', function(i, elem) {
                $(elem).addClass('test');
            });

            setFixtures('<div data-plenty-checkout-template="Totals" id="testContainer">Old Totals</div>');
        });

        it("should reload and insert content in marked containers", function() {

            expect( $('#testContainer') ).toHaveText('Old Totals');

            CheckoutFactory.reloadContainer('Totals');
            expect( $('#testContainer') ).toHaveText('New Totals');

        });

        it("should bind directives to added content", function() {

            CheckoutFactory.reloadContainer('Totals');
            expect( $('#testContainer').find('div') ).toHaveClass('test');
            expect( testDirective.elements ).toContain( $('#testContainer').find('div')[0] );

        });

        it("should show and hide WaitScreen", function() {

            var currentWaitScreenCount = UIFactory.showWaitScreen() - 1;

            CheckoutFactory.reloadContainer('Totals');

            expect( UIFactory.showWaitScreen ).toHaveBeenCalled();
            expect( UIFactory.hideWaitScreen ).toHaveBeenCalled();

            // all wait screens opened by tested function are close again after execution
            expect( UIFactory.hideWaitScreen() ).toEqual( currentWaitScreenCount );

        });

    });

    describe("CheckoutFactory.reloadCatContent() ", function() {

        var UIFactory, CMSFactory;
        var testDirective;

        beforeEach(function() {
            UIFactory = PlentyFramework.factories.UIFactory;
            CMSFactory = PlentyFramework.factories.CMSFactory;

            spyOn( UIFactory, 'showWaitScreen').and.callThrough();
            spyOn( UIFactory, 'hideWaitScreen').and.callThrough();
            spyOn( CMSFactory, 'getCategoryContent').and.callThrough();

            jasmine.Ajax.stubRequest(/\/rest\/categoryview\/categorycontentbody\/\?categoryID=\d/)
                .andReturn({
                    status: 200,
                    statusText: 'HTTP/1.1 200 OK',
                    contentType: 'text/html',
                    responseText: JSON.stringify(Responses.GET.category_content)
                });

            testDirective = PlentyFramework.directive('[data-test]', function(i, elem) {
                $(elem).addClass('test');
            });

            setFixtures('<div data-plenty-checkout-catcontent="5" id="testContainer">Old category content</div>');
        });

        it("should reload and insert content in marked containers", function() {

            expect( $('#testContainer') ).toHaveText('Old category content');

            CheckoutFactory.reloadCatContent(4);
            expect( $('#testContainer') ).not.toHaveText('New category content');
            expect( $('#testContainer') ).toHaveText('Old category content');

            CheckoutFactory.reloadCatContent(5);
            expect( $('#testContainer') ).toHaveText('New category content');

        });

        it("should bind directives to added content", function() {

            CheckoutFactory.reloadCatContent(5);
            expect( $('#testContainer').find('div') ).toHaveClass('test');
            expect( testDirective.elements ).toContain( $('#testContainer').find('div')[0] );

        });

        it("should show and hide WaitScreen", function() {

            var currentWaitScreenCount = UIFactory.showWaitScreen() - 1;

            CheckoutFactory.reloadCatContent(5);

            expect( UIFactory.showWaitScreen ).toHaveBeenCalled();
            expect( UIFactory.hideWaitScreen ).toHaveBeenCalled();

            // all wait screens opened by tested function are close again after execution
            expect( UIFactory.hideWaitScreen() ).toEqual( currentWaitScreenCount );

        });

    });

    describe("CheckoutFactory.reloadItemContainer() ", function() {

        var UIFactory, CMSFactory;
        var testDirective;

        beforeEach(function() {
            UIFactory = PlentyFramework.factories.UIFactory;
            CMSFactory = PlentyFramework.factories.CMSFactory;

            spyOn( UIFactory, 'showWaitScreen').and.callThrough();
            spyOn( UIFactory, 'hideWaitScreen').and.callThrough();
            spyOn( CMSFactory, 'getContainer').and.callThrough();

            jasmine.Ajax.stubRequest('/rest/itemview/container_itemviewbasketpreviewlist/')
                .andReturn({
                    status: 200,
                    statusText: 'HTTP/1.1 200 OK',
                    contentType: 'text/html',
                    responseText: JSON.stringify(Responses.GET.container_basketpreviewlist)
                });

            testDirective = PlentyFramework.directive('[data-test]', function(i, elem) {
                $(elem).addClass('test');
            });

            setFixtures('<div data-plenty-itemview-template="BasketPreviewList" id="testContainer">Old itemview content</div>');
        });

        it("should reload and insert content in marked containers", function() {

            expect( $('#testContainer') ).toHaveText('Old itemview content');

            CheckoutFactory.reloadItemContainer('BasketPreviewList');
            expect( $('#testContainer') ).toHaveText('New itemview content');

        });

        it("should bind directives to added content", function() {

            CheckoutFactory.reloadItemContainer('BasketPreviewList');
            expect( $('#testContainer').find('div') ).toHaveClass('test');
            expect( testDirective.elements ).toContain( $('#testContainer').find('div')[0] );

        });

        it("should show and hide WaitScreen", function() {

            var currentWaitScreenCount = UIFactory.showWaitScreen() - 1;

            CheckoutFactory.reloadItemContainer('BasketPreviewList');

            expect( UIFactory.showWaitScreen ).toHaveBeenCalled();
            expect( UIFactory.hideWaitScreen ).toHaveBeenCalled();

            // all wait screens opened by tested function are close again after execution
            expect( UIFactory.hideWaitScreen() ).toEqual( currentWaitScreenCount );

        });

    });


});