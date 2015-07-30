describe("Plentyframework initialization", function() {

    var pm;

    beforeEach(function () {
        pm = PlentyFramework;
    });

    it("plentyframework and $/jquery should be defined", function () {
        expect($).toBeDefined();
        expect(PlentyFramework).toBeDefined();
    });

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