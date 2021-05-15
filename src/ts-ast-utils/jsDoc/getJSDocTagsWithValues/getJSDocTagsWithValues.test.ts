import { tagUnindent } from "../../../es-utils/index";
import { createMockSourceFile } from "../../../test-utils/createMockSourceFile";
import { getJSDocTagsWithValues, getJSDocTagsWithValuesReturnType } from "./getJSDocTagsWithValues";

describe(getJSDocTagsWithValues.name, () => {
    it("returns an empty value for missing jsDoc comment", () => {
        const s = createMockSourceFile(tagUnindent`
            export declare type _ = number;
        `).statements[0];
        expect(getJSDocTagsWithValues(s)).toEqual<getJSDocTagsWithValuesReturnType>({
            comment: undefined,
            tagAndComment: [],
        });
    });
    it("returns an empty value for empty jsDoc comment", () => {
        const s = createMockSourceFile(tagUnindent`
            /***/
            export declare type _ = number;
        `).statements[0];
        expect(getJSDocTagsWithValues(s)).toEqual<getJSDocTagsWithValuesReturnType>({
            comment: undefined,
            tagAndComment: [],
        });
    });
    it("returns the tag less comment for jsDoc comment without tags", () => {
        const s = createMockSourceFile(tagUnindent`
            /**
             * hello world
            */
            export declare type _ = number;
        `).statements[0];
        expect(getJSDocTagsWithValues(s)).toEqual<getJSDocTagsWithValuesReturnType>({
            comment: "hello world",
            tagAndComment: [],
        });
    });
    it("returns the tag less comment and the tag names with their comments for the last jsDoc comment of the provided ast node", () => {
        const s = createMockSourceFile(tagUnindent`
            /**
             * hello world
             * @description
             * some description
             * @default 1
            */
            export declare type _ = number;
        `).statements[0];
        expect(getJSDocTagsWithValues(s)).toEqual<getJSDocTagsWithValuesReturnType>({
            comment: "hello world",
            tagAndComment: [
                {
                    tagName: "description",
                    comment: "some description",
                },
                {
                    tagName: "default",
                    comment: "1",
                },
            ],
        });
    });
});
