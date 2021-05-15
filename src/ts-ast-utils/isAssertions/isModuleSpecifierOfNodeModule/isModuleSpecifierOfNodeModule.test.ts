import { isModuleSpecifierOfNodeModule } from "./isModuleSpecifierOfNodeModule";

describe(isModuleSpecifierOfNodeModule.name,() => {
    it("returns true when provided with a path to node module",() => {
        expect(isModuleSpecifierOfNodeModule("typescript")).toBe(true);
    })
    it("returns true when provided with a relative path",() => {
        expect(isModuleSpecifierOfNodeModule("./somewhere")).toBe(false);
    })
});