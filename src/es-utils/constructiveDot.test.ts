import { constructiveDot, _errorMessages } from "./constructiveDot";

describe(constructiveDot.name, () => {
    describe("works like normal object dotting, but adds object literal for dots that return undefined", () => {
        it("works properly when all of the dot path does not exist", () => {
            const baseObj = {};
            constructiveDot(baseObj, ["prop1", "prop2"]).prop3 = "a string";
            expect(baseObj).toEqual({
                prop1: {
                    prop2: {
                        prop3: "a string",
                    },
                },
            });
        });
        it("works properly for properties that are numbers", () => {
            const baseObj = {};
            constructiveDot(baseObj, ["prop1", 2]).prop3 = "a string";
            expect(baseObj).toEqual({
                prop1: {
                    2: {
                        prop3: "a string",
                    },
                },
            });
        });
        it("works properly when some of the dot path exists", () => {
            const baseObj = { prop1: {} };
            constructiveDot(baseObj, ["prop1", "prop2"]).prop3 = "a string";
            expect(baseObj).toEqual({
                prop1: {
                    prop2: {
                        prop3: "a string",
                    },
                },
            });
        });
        it("works properly when all of the path exists", () => {
            const baseObj = { prop1: { prop2: {} } };
            constructiveDot(baseObj, ["prop1", "prop2"]).prop3 = "a string";
            expect(baseObj).toEqual({
                prop1: {
                    prop2: {
                        prop3: "a string",
                    },
                },
            });
        });
        it("throws error when the dot path stumbles upon a non object", () => {
            const baseObj = { prop1: { 2: 1 } };
            expect(() => constructiveDot(baseObj, ["prop1", 2, "prop3"])).toThrow(_errorMessages.badPath(["prop1",2]));
        });
    });
});
