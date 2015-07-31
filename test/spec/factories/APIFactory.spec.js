describe("APIFactory", function() {

    var request;
    var APIFactory, UIFactory;

    beforeEach( function() {
        jasmine.Ajax.install();
        jasmine.addMatchers( customMatcher );


        PlentyFramework.compile();
        APIFactory = PlentyFramework.factories['APIFactory'];

        UIFactory = PlentyFramework.factories['UIFactory'];
        spyOn( UIFactory, 'printErrors' );
        spyOn( UIFactory, 'throwError' )
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

    it("should provide functions for sending API-requests", function() {

        expect( APIFactory.get ).toBeFunction();
        expect( APIFactory.post ).toBeFunction();
        expect( APIFactory.put ).toBeFunction();
        expect( APIFactory.delete ).toBeFunction();
        expect( APIFactory.idle ).toBeFunction();

    });

    describe("APIFactory.get", function() {

        it("handle errors if request fails and returns an error", function() {

            APIFactory.get( "rest/test/" );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                responseText: '{"error":{"error_stack":[{"code":"0", "message":"Some Error Message"}]}}'
            });

            expect( UIFactory.printErrors ).toHaveBeenCalled();
        });

        it("handle errors if request fails and doesn't return an error", function() {

            APIFactory.get( "rest/test/" );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                statusText: 'Internal Server Error'
            });

            expect( UIFactory.throwError ).toHaveBeenCalled();

        });

        it("can skip default error handling", function() {

            APIFactory.get( "rest/test/", {}, true );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                statusText: 'Internal Server Error'
            });

            expect( UIFactory.throwError ).not.toHaveBeenCalled();
            expect( UIFactory.printErrors ).not.toHaveBeenCalled();

        });

    });

    describe("APIFactory.post", function() {

        it("handle errors if request fails and returns an error", function() {

            APIFactory.post( "rest/test/", {} );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                responseText: '{"error":{"error_stack":[{"code":"0", "message":"Some Error Message"}]}}'
            });

            expect( UIFactory.printErrors ).toHaveBeenCalled();
        });

        it("handle errors if request fails and doesn't return an error", function() {

            APIFactory.post( "rest/test/", {} );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                statusText: 'Internal Server Error'
            });

            expect( UIFactory.throwError ).toHaveBeenCalled();

        });

        it("can skip default error handling", function() {

            APIFactory.post( "rest/test/", {}, true );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                statusText: 'Internal Server Error'
            });

            expect( UIFactory.throwError ).not.toHaveBeenCalled();
            expect( UIFactory.printErrors ).not.toHaveBeenCalled();

        });

        it("can send data to server", function() {

            APIFactory.post( "rest/test/", {foo: "bar"} );
            request = jasmine.Ajax.requests.mostRecent();

            expect( request.params ).toEqual( JSON.stringify({foo: "bar"}) );

        });

    });

    describe("APIFactory.put", function() {

        it("handle errors if request fails and returns an error", function() {

            APIFactory.put( "rest/test/", {} );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                responseText: '{"error":{"error_stack":[{"code":"0", "message":"Some Error Message"}]}}'
            });

            expect( UIFactory.printErrors ).toHaveBeenCalled();
        });

        it("handle errors if request fails and doesn't return an error", function() {

            APIFactory.put( "rest/test/", {} );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                statusText: 'Internal Server Error'
            });

            expect( UIFactory.throwError ).toHaveBeenCalled();

        });

        it("can skip default error handling", function() {

            APIFactory.put( "rest/test/", {}, true );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                statusText: 'Internal Server Error'
            });

            expect( UIFactory.throwError ).not.toHaveBeenCalled();
            expect( UIFactory.printErrors ).not.toHaveBeenCalled();

        });

        it("can send data to server", function() {

            APIFactory.put( "rest/test/", {foo: "bar"} );
            request = jasmine.Ajax.requests.mostRecent();

            expect( request.params ).toEqual( JSON.stringify({foo: "bar"}) );

        });

    });

    describe("APIFactory.delete", function() {

        it("handle errors if request fails and returns an error", function() {

            APIFactory.delete( "rest/test/", {} );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                responseText: '{"error":{"error_stack":[{"code":"0", "message":"Some Error Message"}]}}'
            });

            expect( UIFactory.printErrors ).toHaveBeenCalled();
        });

        it("handle errors if request fails and doesn't return an error", function() {

            APIFactory.delete( "rest/test/", {} );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                statusText: 'Internal Server Error'
            });

            expect( UIFactory.throwError ).toHaveBeenCalled();

        });

        it("can skip default error handling", function() {

            APIFactory.delete( "rest/test/", {}, true );
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 500,
                statusText: 'Internal Server Error'
            });

            expect( UIFactory.throwError ).not.toHaveBeenCalled();
            expect( UIFactory.printErrors ).not.toHaveBeenCalled();

        });

        it("can send data to server", function() {

            APIFactory.delete( "rest/test/", {foo: "bar"} );
            request = jasmine.Ajax.requests.mostRecent();

            expect( request.params ).toEqual( JSON.stringify({foo: "bar"}) );

        });

    });

    describe("APIFactory.idle", function() {

        it("is always resolved", function() {

            request = APIFactory.idle();
            expect( request.isResolved() ).toBe( true );
            expect( request.isRejected() ).toBe( false );
        });

    });

});