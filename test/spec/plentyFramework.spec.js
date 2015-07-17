describe("Plentyframework initialization", function() {

    var pm;

    beforeEach(function () {
        PlentyFramework.compile()
        pm = PlentyFramework.getInstance();
        console.log("neue Directive: " + pm);
        //pm.compile();
    });

    it("plentyframework and $/jquery should be defined", function () {
        expect($).toBeDefined();
        expect(window.PlentyFramework).toBeDefined();
    });

    it("should push and return a custom directive", function () {
        spyOn(pm, "directive");
        spyOn(getDirectives(pm), "push").and.callThrough();

        var directivesCount = pm.directives.length;
        var directive = pm.directive("[foo]", function () {});
        console.log("neue Directive: " + pm);

        expect(pm.directive).toHaveBeenCalled();
        expect(getDirectives(pm).push).toHaveBeenCalledWith(directive);
        expect(pm.directives.length).toEqual(directivesCount + 1);
    });

    xit("should return a directive", function () {
        spyOn(getDirectives(pm), "push");
        spyOn(pm, "directive");
        var directive = pm.directive("foo", "bar");
        console.log("neue Directive: " + directive);

        expect(pm.directive).toHaveBeenCalled();
        expect(getDirectives(pm).push).toHaveBeenCalled();
        expect(pm.directive()).toEqual(directive);
    });
});

function getDirectives(pm) {
    return pm.directives;
}