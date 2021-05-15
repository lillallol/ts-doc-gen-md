import { firstLinesFactory } from "./firstLinesFactory";
import { tagUnindent } from "./tagUnindent";

describe(firstLinesFactory.name, () => {
    it("acts like a first lines strategy", () => {
        expect(
            firstLinesFactory(5)(tagUnindent`
            1
            2
            3
            4
            5
            6
        `)
        ).toBe(tagUnindent`
            1
            2
            3
            4
            5
            ...
        `);
    });
});
