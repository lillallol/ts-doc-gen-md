import { tagUnindent } from "../../../es-utils/index";
import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { getJSDocTagValue } from "./getJSDocTagValue";

const s = createMockSourceFile(tagUnindent`
    /**
     * I am the tag less comment
     * @customTag
     * hello world
     * @description
     * no description
     * @customTag
     * @customTag
     * bye world
    */
    declare type = number;
`).statements[0];

describe(getJSDocTagValue.name, () => {
    it("returns the value of the specified jsDoc tag", () => {
        expect(getJSDocTagValue(s, "customTag")).toEqual(["hello world", undefined, "bye world"]);
    });
    it("returns the tag less comment for provided jsDoc tag name being `null`", () => {
        expect(getJSDocTagValue(s, null)).toEqual([`I am the tag less comment`]);
    });
    it("throws when the provided ast node does not have the specified jsDoc tag", () => {
        const tagName = "myCustomTag";
        expect(getJSDocTagValue(s, tagName)).toBe(undefined);
    });
});
