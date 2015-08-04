/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Maximilian Lauterbach <maximilian.lauterbach@plentymarkets.com>
 * =====================================================================================
 */

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
            var plenty = pm.getInstance();
            pm.directive("[foo]", function () {});

            spyOn(plenty, "bindDirectives");

            plenty.bindDirectives();

            expect(plenty.bindDirectives).toHaveBeenCalled();
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

        it("should register a service", function () {
            var fooService = {
                name: "fooService",
                dependencies: []
            };
            spyOn(pm, "resolveFactories");

            pm.service("fooService", function () {});
            fooService.compile = pm.components.services["fooService"].compile;
            pm.components.services["fooService"].compile();

            expect(pm.components.services["fooService"]).toEqual(fooService);
            expect(pm.resolveFactories).toHaveBeenCalled();
        });
    });

    describe("PlentyFramework.resolveServices", function () {
        it("should resolve service dependencies", function () {
            pm.service("bar", function () {});
            pm.service("baz", function () {});
            pm.service("fooService", function () {}, ["bar", "baz"]);

            spyOn(pm.components.services["bar"], "compile");
            spyOn(pm.components.services["baz"], "compile");
            pm.resolveServices(["bar", "baz"]);

            expect(pm.components.services["bar"].compile).toHaveBeenCalled();
            expect(pm.components.services["baz"].compile).toHaveBeenCalled();
        });

        it("should throw Service-not-found exception", function () {
            spyOn(console, "error");

            expect(pm.resolveServices(["nope"])).toEqual([]);
            expect(console.error).toHaveBeenCalledWith('Cannot inject Service "nope": Service not found.');
        });
    });

    describe("PlentyFramework.factory", function () {
        var factory = {
            name: "fooFactory",
            dependencies: []
        };

        it("should fail to register a factory on first param (factory name)", function () {
            spyOn(console, "error");
            pm.factory(undefined);

            expect(console.error).toHaveBeenCalledWith("Type mismatch: Expect first parameter to be a 'string', 'undefined' given.");
        });

        it("should fail to register a factory on second param (factory functions)", function () {
            spyOn(console, "error");
            factory = pm.factory("fooFactory", undefined);

            expect(console.error).toHaveBeenCalledWith("Type mismatch: Expect second parameter to be a 'function', 'undefined' given.");
        });

        it("should register a factory", function () {
            var fooFactory = {
                name: "fooFactory",
                dependencies: []
            };
            spyOn(pm, "resolveFactories");

            pm.factory("fooFactory", function () {});
            fooFactory.compile = pm.components.factories["fooFactory"].compile;
            pm.components.factories["fooFactory"].compile();

            expect(pm.components.factories["fooFactory"]).toEqual(fooFactory);
            expect(pm.resolveFactories).toHaveBeenCalled();
        });
    });

    describe("PlentyFramework.resolveFactories", function () {
        it("should resolve factory dependencies", function () {
            pm.factory("bar", function () {});
            pm.factory("baz", function () {});
            pm.factory("fooFactory", function () {}, ["bar", "baz"]);

            spyOn(pm.components.factories["bar"], "compile");
            spyOn(pm.components.factories["baz"], "compile");
            pm.resolveFactories(["bar", "baz"]);

            expect(pm.components.factories["bar"].compile).toHaveBeenCalled();
            expect(pm.components.factories["baz"].compile).toHaveBeenCalled();
        });

        it("should throw Service-not-found exception", function () {
            spyOn(console, "error");

            expect(pm.resolveFactories(["nope"])).toEqual([]);
            expect(console.error).toHaveBeenCalledWith('Cannot inject Factory "nope": Factory not found.');
        });
    });
});