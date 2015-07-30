describe("Plentyframework initialization", function() {

    var pm;

    beforeEach(function () {
        pm = PlentyFramework;
    });

    it("plentyframework and $/jquery should be defined", function () {
        expect($).toBeDefined();
        expect(PlentyFramework).toBeDefined();
    });

    describe("PlentyFramework.setGlobal", function () {
        it("should add a global variable to PlentyFramework and return it", function () {
            var globalVar = pm.setGlobal("foo", "bar");

            expect(pm.globals).toBeDefined();
            expect(pm.getGlobal("foo")).toBe(globalVar);
        });

        it("should not add a global variable to PlentyFramework, but throw error and return 'null'", function () {
            spyOn(console, "error");

            var globalsCount = pm.globals.length;
            var globalVar = pm.setGlobal("foo", "bar");

            expect(pm.globals.length).toBe(globalsCount);
            expect(console.error).toHaveBeenCalledWith('Global variable "foo" already exists and cannot be overridden.');
            expect(globalVar).toBeNull();
        });
    });

    describe("PlentyFramework.directives", function () {
        it("should push and return a custom directive", function () {
            spyOn(pm.directives, "push").and.callThrough();

            var directivesCount = pm.directives.length;
            var directive = pm.directive("[foo]", function () {});

            expect(pm.directives.push).toHaveBeenCalledWith(directive);
            expect(pm.directives[directivesCount]).toBe(directive);
            expect(pm.directives.length).toEqual(directivesCount + 1);
        });

        it("should call pm.directive()", function () {
            spyOn(pm, "directive");

            var directive = pm.directive("[foo]", function () {});

            expect(pm.directive).toHaveBeenCalled();
        });
    });

    describe("PlentyFramework.prototype.bindDirectives", function () {
        it("should bind directives", function () {
            spyOn(PlentyFramework.prototype, "bindDirectives");
            //spyOn($, "each");

            PlentyFramework.prototype.bindDirectives("[foo1]");

            expect(PlentyFramework.prototype.bindDirectives).toHaveBeenCalledWith("[foo1]");
            //expect($.each).toHaveBeenCalledWith(pm.directives);
        });
    });

    describe("PlentyFramework.service", function () {
        it("should not register a service with no service name", function () {
            spyOn(console, "error");
            pm.service(null);

            expect(console.error).toHaveBeenCalledWith("Type mismatch: Expect first parameter to be a 'string', 'object' given.");
        });

        it("should not register a service with no function", function () {
            spyOn(console, "error");
            pm.service("foo", null);

            expect(console.error).toHaveBeenCalledWith("Type mismatch: Expect second parameter to be a 'function', 'object' given.");
        });
    });
});