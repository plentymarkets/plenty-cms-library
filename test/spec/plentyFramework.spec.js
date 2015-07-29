describe("Plentyframework initialization", function() {

    var pm;

    beforeEach(function () {
        pm = PlentyFramework;
    });

    it("plentyframework and $/jquery should be defined", function () {
        expect($).toBeDefined();
        expect(PlentyFramework).toBeDefined();
    });

    it("should push and return a custom directive", function () {
        spyOn(getDirectives(pm), "push").and.callThrough();

        var directivesCount = pm.directives.length;
        var directive = pm.directive("[foo]", function () {});

        expect(getDirectives(pm).push).toHaveBeenCalledWith(directive);
        expect(pm.directives[directivesCount]).toBe(directive);
        expect(pm.directives.length).toEqual(directivesCount + 1);
    });

    it("should call pm.directive()", function () {
        spyOn(pm, "directive");

        var directive = pm.directive("[foo]", function () {});

        expect(pm.directive).toHaveBeenCalled();
    });

});

function getDirectives(pm) {
    return pm.directives;
}