import { commonMaxIndentLength, _errorMessages } from "./commonMaxIndentLength";

describe(commonMaxIndentLength.name, () => {
    it("returns the length of the common minimum indentation of the provided string, ignoring empty lines", () => {
        expect(
            commonMaxIndentLength(
                // prettier-ignore
                "\n" +
                "    hello\n" +
                "     \n" +
                "  world"
            )
        ).toBe(2);
    });
    it("throws if the provided string has tab character in the indentation string", () => {
        expect(() =>
            commonMaxIndentLength(
                // prettier-ignore
                "\n" +
                "hello\n" +
                "\n"+
                "    \tworld"
            )
        ).toThrow(_errorMessages.badIndentSpaceCharacter);
    });
});
