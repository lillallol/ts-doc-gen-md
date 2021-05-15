import {
    printNodeObject,
    isExportStatementChain,
    getStatementsOf,
    isExportStatementNonChain,
} from "../../ts-ast-utils/index";
import { tagUnindent } from "../../es-utils/index";
import { resolvePublicApi } from "../resolve/resolvePublicApi";
import { createFs } from "../../test-utils/createFs";
import { format } from "../../ts-doc-gen/format/format";

/**
 * ## Leaf export statements :
 *
 * - VS = variable statement
 * - FD = function declaration
 * - CD = class declaration
 * - TA = type alias declaration
 * - ID = interface declaration
 *
 * - SEN = es namespace export from node module
 * - DEN = delegation export from node module
 * - NEN = named export from node module
 *
 * ## Non leaf export statements :
 *
 * - NEF = named export path full
 * - DLE = delegation export
 * - NSE = namespace export
 * - NEL = named export pathless
 * - DFE = default export
 *
 * - INS = import namespace without default import
 * - IN = import named without default import
 * - INSD = import namespace that has default import
 * - IND = import named that has default import
 *
 * - NEFE = NEF empty
 * - NELE = NEL empty
 *
 * ## Testing
 *
 * I should create all the permutations and test them.
 *
 * Each test also has the following statement :
 *
 * ```ts
 * declare const shouldBeIgnored = null;
 * ```
 *
 * with its only role to be tested that is properly ignored.
 */
//@TODO I have to forgotten to test for same identifier concretion type
describe("resolve of ExportChainNode instance", () => {
    describe("tests for one node chain", () => {
        test(
            "variable statement",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare const a: {}, b: {};

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export declare const a: {}, b: {};
                        `,
                        resolutionIndex: 0,
                        exposedName: "a",
                    },
                    {
                        statement: `
                            export declare const a: {}, b: {};
                        `,
                        resolutionIndex: 1,
                        exposedName: "b",
                    },
                ],
            })
        );
        test(
            "function declaration",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare function foo(): void;

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        exposedName: "foo",
                        resolutionIndex: 0,
                        statement: `
                            export declare function foo(): void;
                        `,
                    },
                ],
            })
        );
        test(
            "class declaration",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare class A { constructor();}

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export declare class A { constructor();}
                        `,
                        exposedName: "A",
                        resolutionIndex: 0,
                    },
                ],
            })
        );
        test(
            "type alias declaration",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare type a = { a: number; b: string; };

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export declare type a = { a: number; b: string; };
                        `,
                        exposedName: "a",
                        resolutionIndex: 0,
                    },
                ],
            })
        );
        test(
            "interface declaration",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export interface b { a: number; b: string; }

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export interface b { a: number; b: string; }
                        `,
                        exposedName: "b",
                        resolutionIndex: 0,
                    },
                ],
            })
        );
        test(
            "es namespace import from node module",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export * as ts from "typescript";

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export * as ts from "typescript";
                        `,
                        exposedName: "ts.*typescript",
                        resolutionIndex: 0,
                    },
                ],
            })
        );
        test(
            "delegation export from node module",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export * from "lodash";

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export * from "lodash";
                        `,
                        exposedName: "*lodash",
                        resolutionIndex: 0,
                    },
                ],
            })
        );
        test(
            "named export from node module",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export {f1 as F1,F2,default as F3,default} from "node-module";

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export {f1 as F1,F2,default as F3,default} from "node-module";
                        `,
                        exposedName: "F1",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export {f1 as F1,F2,default as F3,default} from "node-module";
                        `,
                        exposedName: "F2",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            export {f1 as F1,F2,default as F3,default} from "node-module";
                        `,
                        exposedName: "F3",
                        resolutionIndex: 2,
                    },
                    {
                        statement: `
                            export {f1 as F1,F2,default as F3,default} from "node-module";
                        `,
                        exposedName: "default",
                        resolutionIndex: 3,
                    },
                ],
            })
        );
    });
    describe("tests for two node chain", () => {
        // NEF withouts as
        // !!!! I have ignored the case NEF-DEN since it causes issues
        test(
            tagUnindent`
                NEF-VS
                NEF-FD
                NEF-CD
                NEF-TA
                NEF-ID
                NEF-SEN
                xxNEF-DENxx
                NEF-NEN

                with as
            `,
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export {
                            a,b,
                            foo,
                            A,
                            ts,
                            AA,BB,CC,default
                        } from "./1.mock";

                        declare const shouldBeIgnored = null;
                    `,
                    "1.mock.d.ts": `
                        export declare const a = 1, b = 2;
                        export declare function foo():void;
                        export class A { constructor() {}}
                        export declare type a = {}
                        export interface b {}

                        export * as ts from "typescript";
                        export {AA,b as BB, default as CC, default} from "node-module";

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "a",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare type a = {}
                        `,
                        exposedName: "a",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "b",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            export interface b {}
                        `,
                        exposedName: "b",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare function foo():void;
                        `,
                        exposedName: "foo",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export class A { constructor() {}}
                        `,
                        exposedName: "A",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export * as ts from "typescript";
                        `,
                        exposedName: "ts.*typescript",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "AA",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "BB",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "CC",
                        resolutionIndex: 2,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "default",
                        resolutionIndex: 3,
                    },
                ],
            })
        );
        //NEF with as
        // !!!! I have ignored the case NEF-DEN since it causes issues
        test(
            tagUnindent`
                NEF-VS
                NEF-FD
                NEF-CD
                NEF-TA
                NEF-ID
                NEF-SEN
                xxNEF-DENxx
                NEF-NEN

                with as
            `,
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export {
                            a as _a,b as _b,
                            foo as _foo,
                            A as _A,
                            ts as _ts,
                            AA as _AA,BB as _BB,CC as _CC,default as _default
                        } from "./1.mock";

                        declare const shouldBeIgnored = null;
                    `,
                    "1.mock.d.ts": `
                        export declare const a = 1, b = 2;
                        export declare function foo():void;
                        export class A { constructor() {}}
                        export declare type a = {}
                        export interface b {}

                        export * as ts from "typescript";
                        export {AA,b as BB, default as CC, default} from "node-module";

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "_a",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare type a = {}
                        `,
                        exposedName: "_a",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "_b",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            export interface b {}
                        `,
                        exposedName: "_b",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare function foo():void;
                        `,
                        exposedName: "_foo",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export class A { constructor() {}}
                        `,
                        exposedName: "_A",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export * as ts from "typescript";
                        `,
                        exposedName: "_ts.*typescript",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "_AA",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "_BB",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "_CC",
                        resolutionIndex: 2,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "_default",
                        resolutionIndex: 3,
                    },
                ],
            })
        );
        // DLE
        test(
            tagUnindent`
                DLE-VS
                DLE-FD
                DLE-CD
                DLE-TA
                DLE-ID

                DLE-SEN
                DLE-DEN
                DLE-NEN
            `,
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export * from "./1.mock";

                        declare const shouldBeIgnored = null;
                    `,
                    "1.mock.d.ts": `
                        export declare const a = 1, b = 2;
                        export declare function foo():void;
                        export class A { constructor() {}}
                        export declare type obj = {}
                        export interface I {}

                        export * as ts from "typescript";
                        export * from "lodash";
                        export {AA,b as BB, default as CC, default} from "node-module";

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "a",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "b",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            export declare function foo():void;
                        `,
                        exposedName: "foo",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export class A { constructor() {}}
                        `,
                        exposedName: "A",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare type obj = {}
                        `,
                        exposedName: "obj",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export interface I {}
                        `,
                        exposedName: "I",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export * as ts from "typescript";
                        `,
                        exposedName: "ts.*typescript",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export * from "lodash";
                        `,
                        exposedName: "*lodash",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "AA",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "BB",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "CC",
                        resolutionIndex: 2,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "default",
                        resolutionIndex: 3,
                    },
                ],
            })
        );
        // NSE
        test(
            tagUnindent`
                NSE-VS
                NSE-FD
                NSE-CD
                NSE-TA
                NSE-ID

                NSE-SEN
                NSE-DEN
                NSE-NEN
            `,
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export * as ns from "./1.mock";

                        declare const shouldBeIgnored = null;
                    `,
                    "1.mock.d.ts": `
                        export declare const a = 1, b = 2;
                        export declare function foo():void;
                        export class A { constructor() {}}
                        export declare type obj = {}
                        export interface I {}

                        export * as ts from "typescript";
                        export * from "lodash";
                        export {AA,b as BB, default as CC, default} from "node-module";

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "ns.a",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "ns.b",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            export declare function foo():void;
                        `,
                        exposedName: "ns.foo",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export class A { constructor() {}}
                        `,
                        exposedName: "ns.A",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare type obj = {}
                        `,
                        exposedName: "ns.obj",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export interface I {}
                        `,
                        exposedName: "ns.I",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export * as ts from "typescript";
                        `,
                        exposedName: "ns.ts.*typescript",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export * from "lodash";
                        `,
                        exposedName: "ns.*lodash",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "ns.AA",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "ns.BB",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "ns.CC",
                        resolutionIndex: 2,
                    },
                    {
                        statement: `
                            export {AA,b as BB, default as CC, default} from "node-module";
                        `,
                        exposedName: "ns.default",
                        resolutionIndex: 3,
                    },
                ],
            })
        );
        // NEL without as
        test(
            tagUnindent`
                NEL-VS
                NEL-FD
                NEL-CD
                NEL-TA
                NEL-ID

                NEL-INS
                NEL-IN
                NEL-INSD
                NEL-IND
            `,
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export {
                            a,b,foo,A,obj,I,
                            AA,BB,CC,ts,
                            bar,_AA,_BB,_CC,baz,_ts
                        };

                        /**@private*/
                        export declare const a = 1, b = 2;
                        /**@private*/
                        export declare const foo = 1;
                        /**@private*/
                        export class A { constructor() {}}
                        /**@private*/
                        export declare type obj = {}
                        /**@private*/
                        export interface I {}

                        import {AA,bb as BB,default as CC} from "lodash";
                        import * as ts from "typescript";

                        import bar, {_AA,bb as _BB,default as _CC} from "lodash";
                        import baz, * as _ts from "typescript";

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            /**@private*/
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "a",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            /**@private*/
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "b",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            /**@private*/
                            export declare const foo = 1;
                        `,
                        exposedName: "foo",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            /**@private*/
                            export class A { constructor() {}}
                        `,
                        exposedName: "A",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            /**@private*/
                            export declare type obj = {}
                        `,
                        exposedName: "obj",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            /**@private*/
                            export interface I {}
                        `,
                        exposedName: "I",
                        resolutionIndex: 0,
                    },

                    {
                        statement: `
                            import {AA,bb as BB,default as CC} from "lodash";
                        `,
                        exposedName: "AA",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            import {AA,bb as BB,default as CC} from "lodash";
                        `,
                        exposedName: "BB",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            import {AA,bb as BB,default as CC} from "lodash";
                        `,
                        exposedName: "CC",
                        resolutionIndex: 2,
                    },
                    {
                        statement: `
                            import * as ts from "typescript";
                        `,
                        exposedName: "ts.*typescript",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            import bar, {_AA,bb as _BB,default as _CC} from "lodash";
                        `,
                        exposedName: "bar",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            import bar, {_AA,bb as _BB,default as _CC} from "lodash";
                        `,
                        exposedName: "_AA",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            import bar, {_AA,bb as _BB,default as _CC} from "lodash";
                        `,
                        exposedName: "_BB",
                        resolutionIndex: 2,
                    },
                    {
                        statement: `
                            import bar, {_AA,bb as _BB,default as _CC} from "lodash";
                        `,
                        exposedName: "_CC",
                        resolutionIndex: 3,
                    },
                    {
                        statement: `
                            import baz, * as _ts from "typescript";
                        `,
                        exposedName: "baz",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            import baz, * as _ts from "typescript";
                        `,
                        exposedName: "_ts.*typescript",
                        resolutionIndex: 1,
                    },
                ],
            })
        );
        // NEL with as
        test(
            tagUnindent`
                NEL-VS
                NEL-FD
                NEL-CD
                NEL-TA
                NEL-ID

                NEL-INS
                NEL-IN
                NEL-INSD
                NEL-IND
            `,
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export {
                            a as _a,b as _b,foo as _foo,A as _A,obj as _obj,I as _I,
                            AA as _AA,BB as _BB,CC as _CC,ts as _ts,
                            bar as _bar,_AA as __AA,_BB as __BB,_CC as __CC,baz as _baz,_ts as __ts
                        };

                        export declare const a = 1, b = 2;
                        export declare const foo = 1;
                        export class A { constructor() {}}
                        export declare type obj = {}
                        export interface I {}

                        import {AA,bb as BB,default as CC} from "lodash";
                        import * as ts from "typescript";

                        import bar, {_AA,bb as _BB,default as _CC} from "lodash";
                        import baz, * as _ts from "typescript";

                        declare const shouldBeIgnored = null;
                    `,
                },
                resolutionInformation: [
                    {
                        exposedName: "a",
                        resolutionIndex: 0,
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                    },
                    {
                        exposedName: "b",
                        resolutionIndex: 1,
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                    },
                    {
                        exposedName: "foo",
                        resolutionIndex: 0,
                        statement: `
                            export declare const foo = 1;
                        `,
                    },
                    {
                        exposedName: "A",
                        resolutionIndex: 0,
                        statement: `
                            export class A { constructor() {}}
                        `,
                    },
                    {
                        exposedName: "obj",
                        resolutionIndex: 0,
                        statement: `
                            export declare type obj = {}
                        `,
                    },
                    {
                        exposedName: "I",
                        resolutionIndex: 0,
                        statement: `
                            export interface I {}
                        `,
                    },
                    {
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "_a",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                        exposedName: "_b",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            export declare const foo = 1;
                        `,
                        exposedName: "_foo",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export class A { constructor() {}}
                        `,
                        exposedName: "_A",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export declare type obj = {}
                        `,
                        exposedName: "_obj",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            export interface I {}
                        `,
                        exposedName: "_I",
                        resolutionIndex: 0,
                    },

                    {
                        statement: `
                            import {AA,bb as BB,default as CC} from "lodash";
                        `,
                        exposedName: "_AA",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            import {AA,bb as BB,default as CC} from "lodash";
                        `,
                        exposedName: "_BB",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            import {AA,bb as BB,default as CC} from "lodash";
                        `,
                        exposedName: "_CC",
                        resolutionIndex: 2,
                    },
                    {
                        statement: `
                            import * as ts from "typescript";
                        `,
                        exposedName: "_ts.*typescript",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            import bar, {_AA,bb as _BB,default as _CC} from "lodash";
                        `,
                        exposedName: "_bar",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            import bar, {_AA,bb as _BB,default as _CC} from "lodash";
                        `,
                        exposedName: "__AA",
                        resolutionIndex: 1,
                    },
                    {
                        statement: `
                            import bar, {_AA,bb as _BB,default as _CC} from "lodash";
                        `,
                        exposedName: "__BB",
                        resolutionIndex: 2,
                    },
                    {
                        statement: `
                            import bar, {_AA,bb as _BB,default as _CC} from "lodash";
                        `,
                        exposedName: "__CC",
                        resolutionIndex: 3,
                    },
                    {
                        statement: `
                            import baz, * as _ts from "typescript";
                        `,
                        exposedName: "_baz",
                        resolutionIndex: 0,
                    },
                    {
                        statement: `
                            import baz, * as _ts from "typescript";
                        `,
                        exposedName: "__ts.*typescript",
                        resolutionIndex: 1,
                    },
                ],
            })
        );

        // DFE
        test(
            "DFE-VS DFE-ID",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export default b;

                        export declare const a = 1, b = 2;
                        export interface b {}
                    `,
                },
                resolutionInformation: [
                    {
                        exposedName: "a",
                        resolutionIndex: 0,
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                    },
                    {
                        exposedName: "b",
                        resolutionIndex: 1,
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                    },
                    {
                        exposedName: "b",
                        resolutionIndex: 0,
                        statement: `
                            export interface b {}
                        `,
                    },
                    {
                        exposedName: "default",
                        resolutionIndex: 1,
                        statement: `
                            export declare const a = 1, b = 2;
                        `,
                    },
                    {
                        exposedName: "default",
                        resolutionIndex: 0,
                        statement: `
                            export interface b {}
                        `,
                    },
                ],
            })
        );
        test(
            "DFE-FD DFE-ID",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export default b;

                        export declare function b():void;
                        export interface b {}
                    `,
                },
                resolutionInformation: [
                    {
                        exposedName: "b",
                        resolutionIndex: 0,
                        statement: `
                            export declare function b():void;
                        `,
                    },
                    {
                        exposedName: "b",
                        resolutionIndex: 0,
                        statement: `
                            export interface b {}
                        `,
                    },
                    {
                        exposedName: "default",
                        resolutionIndex: 0,
                        statement: `
                            export declare function b():void;
                        `,
                    },
                    {
                        exposedName: "default",
                        resolutionIndex: 0,
                        statement: `
                            export interface b {}
                        `,
                    },
                ],
            })
        );
        test(
            "DFE-CD DFE-TA",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export default b;

                        export class b { constructor() {}}
                        export declare type b = {};
                    `,
                },
                resolutionInformation: [
                    {
                        exposedName: "b",
                        resolutionIndex: 0,
                        statement: `
                            export class b { constructor() {}}
                        `,
                    },
                    {
                        exposedName: "b",
                        resolutionIndex: 0,
                        statement: `
                            export declare type b = {};
                        `,
                    },
                    {
                        exposedName: "default",
                        resolutionIndex: 0,
                        statement: `
                            export class b { constructor() {}}
                        `,
                    },
                    {
                        exposedName: "default",
                        resolutionIndex: 0,
                        statement: `
                            export declare type b = {};
                        `,
                    },
                ],
            })
        );

        test(
            "DFE-INSD",
            unitTest({
                fs: {
                    "index.mock.d.ts": tagUnindent`
                        export default foo;
                        import bar, * as foo from "node-module";
                    `,
                },
                resolutionInformation: [
                    {
                        exposedName: "default.*node-module",
                        resolutionIndex: 1,
                        statement: `
                            import bar, * as foo from "node-module";
                        `,
                    },
                ],
            })
        );
        test(
            "DFE-INSD",
            unitTest({
                fs: {
                    "index.mock.d.ts": tagUnindent`
                        export default bar;
                        import bar, * as foo from "node-module";
                    `,
                },
                resolutionInformation: [
                    {
                        exposedName: "default",
                        resolutionIndex: 0,
                        statement: `
                            import bar, * as foo from "node-module";
                        `,
                    },
                ],
            })
        );
        // test(
        //     "DFE-INS",
        //     unitTest({
        //         fs: {
        //             "index.mock.d.ts": tagUnindent`
        //                 export default foo;
        //                 import * as foo from "node-module";
        //             `,
        //         },
        //         resolutionInformation: [
        //             {
        //                 exposedName: "default.*node-module",
        //                 resolutionIndex: 0,
        //                 statement: `
        //                     import * as foo from "node-module";
        //                 `,
        //             },
        //         ],
        //     })
        // );
        // test(
        //     "DFE-ID",
        //     unitTest({
        //         fs: {
        //             "index.mock.d.ts": tagUnindent`
        //                 export default bar;
        //                 import bar from "node-module";
        //             `,
        //         },
        //         resolutionInformation: [
        //             {
        //                 exposedName: "default",
        //                 resolutionIndex: 0,
        //                 statement: `
        //                     import bar from "node-module";
        //                 `,
        //             },
        //         ],
        //     })
        // );
        test(
            "DFE-IND",
            unitTest({
                fs: {
                    "index.mock.d.ts": tagUnindent`
                        export default foo;
                        import bar, {a as A,default as foo,C} from "node-module";
                    `,
                },
                resolutionInformation: [
                    {
                        exposedName: "default",
                        resolutionIndex: 2,
                        statement: `
                            import bar, {a as A,default as foo,C} from "node-module";
                        `,
                    },
                ],
            })
        );
        // NELE
        test(
            "NELE",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export {};
                    `,
                },
                resolutionInformation: [],
            })
        );
        // NEFE
        test(
            "NEFE",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export {} from "1";
                    `,
                    "1.mock.d.ts": `
                    
                    `,
                },
                resolutionInformation: [],
            })
        );
    });
    // describe("tests for three node chain", () => {
    //     it.skip(
    //         "threeChainNode1",
    //         unitTest(
    //             //@TODO maybe add a namespaced exported type
    //             {
    //                 fs: {
    //                     "index.mock.d.ts": `
    //                         export {A as a,B} from "./somewhere.mock";
    //                         export * from "./someplace.mock";
    //                         export * as y from "./someOtherPlace.mock";
    //                     `,
    //                     "somewhere.mock.d.ts": `
    //                         export {AA as A,b as B} from "./somewhereMore.mock";
    //                         //the following should be ignored
    //                         export * from "./someplace.mock";
    //                         export * as x from "./someOtherPlace.mock";
    
    //                         import bar from "./someFile.mock";
    //                         export default bar;
    //                     `,
    //                     "somewhereMore.mock.d.ts": `
    //                         export const AA = 1, B = 2, b = 3;
    //                     `,
    //                     "someplace.mock.d.ts": `
    //                         export {A as AA,b} from "./someplaceMore1.mock";
    //                         export * from "./someplaceMore2.mock";
    //                         export * as x from "./someplaceMore3.mock";
    
    //                         const baz = 1, foo = 2, bar = 3;
    //                         export default foo;
    //                     `,
    //                     "someplaceMore1.mock.d.ts": `
    //                         export const A = 1;
    //                         "hello world";
    //                         export const b = 2;
    //                     `,
    //                     "someplaceMore2.mock.d.ts": `
    //                         export function foo() {}
    //                         "hello world";
    //                         export const AAA = 1, BBB = 2;
    //                         export interface I {
    //                             a : number,
    //                             b : string
    //                         }
    //                     `,
    //                     "someplaceMore3.mock.d.ts": `
    //                         export const A = 1;
    //                         export const B = 1, C = 1;
    //                         export class AA {
    //                             constructor() {
    //                                 //
    //                             }
    //                         }
    //                     `,
    //                     "someOtherPlace.mock.d.ts": `
    //                         export {A as a,B} from "./someOtherPlaceMore1.mock";
    //                         export * from "./someOtherPlaceMore2.mock";
    //                         export * as z from "./someOtherPlaceMore3.mock";
                            
    //                         "hello world";
                            
    //                         const foo = 1 , bar = 2 ,baz = 3;
    //                         export default bar;
    //                     `,
    //                     "someOtherPlaceMore1.mock.d.ts": `
    //                         export const A = 1, a = 2;
    //                         "hello world";
    //                         export const B = 3;
    //                         export default foo;
    //                     `,
    //                     "someOtherPlaceMore2.mock.d.ts": `
    //                         export function foo() {
    
    //                         }
    //                         export class A {
    //                             constructor() {
    //                                 //
    //                             }
    //                         }
    //                     `,
    //                     "someOtherPlaceMore3.mock.d.ts": `
    //                         export type obj = {
    //                             a : number ,
    //                             b : string
    //                         }
    //                         export const A = 1, B = 2;
    //                     `,
    //                 },
    //                 resolutionInformation: [],
    //             }
    //         )
    //     );
    //     test(
    //         "TODO",
    //         unitTest({
    //             fs: {
    //                 "index.mock.d.ts": `
    //                     export default bar;
    //                     import * as bar from "./someFile.mock";
    //                 `,
    //                 "someFile.mock.d.ts": `
    //                     export declare const a = 1 , bar = 2;
    //                     export declare type a = number;
    //                 `,
    //             },
    //             resolutionInformation: [
    //                 {
    //                     exposedName: "default.a",
    //                     resolutionIndex: 0,
    //                     statement: `
    //                         export declare const a = 1 , bar = 2;
    //                     `,
    //                 },
    //                 {
    //                     exposedName: "default.bar",
    //                     resolutionIndex: 1,
    //                     statement: `
    //                         export declare const a = 1 , bar = 2;
    //                     `,
    //                 },
    //                 {
    //                     exposedName: "default.a",
    //                     resolutionIndex: 0,
    //                     statement: `
    //                         export declare type a = number;
    //                     `,
    //                 },
    //             ],
    //         })
    //     );
    //     test(
    //         "twoChainNode5",
    //         unitTest({
    //             fs: {
    //                 "index.mock.d.ts": `
    //                     export default bar;
    //                     import foo , {a as bar , baz as a} from "./someFile.mock";
    //                 `,
    //                 "someFile.mock.d.ts": `
    //                     export const a = () => {};
    //                     export interface a {
    //                         prop : number
    //                     }
    //                 `,
    //             },
    //             resolutionInformation: [
    //                 {
    //                     exposedName: "default",
    //                     resolutionIndex: 0,
    //                     statement: `
    //                         export const a = () => {};
    //                     `,
    //                 },
    //                 {
    //                     exposedName: "default",
    //                     resolutionIndex: 0,
    //                     statement: `
    //                         export interface a {
    //                             prop : number
    //                         }
    //                     `,
    //                 },
    //             ],
    //         })
    //     );
    // });
    describe("tests for four node chain", () => {
        it(
            "TODO",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export default a;
                        import { a,b,c } from "./1.mock";
                    `,
                    "1.mock.d.ts": `
                        export * from "./2.mock";
                    `,
                    "2.mock.d.ts": `
                        export type a = number;
                        export type b = number;
                        export type c = number;
                    `,
                },
                resolutionInformation: [
                    {
                        statement: `
                            export type a = number;
                        `,
                        exposedName: "default",
                        resolutionIndex: 0,
                    },
                ],
            })
        );
        it(
            "TODO",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export default bar;
                        import foo, {default as bar,baz} from "./someFile.mock";
                        type bar = number;
                    `,
                    "someFile.mock.d.ts": `
                        const bar = 1 , foo = 1;
                        export default foo;
                    `,
                },
                resolutionInformation: [
                    {
                        exposedName: "default",
                        resolutionIndex: 0,
                        statement: `
                            type bar = number;
                        `,
                    },
                    {
                        exposedName: "default",
                        resolutionIndex: 1,
                        statement: `
                            const bar = 1 , foo = 1;
                        `,
                    },
                ],
            })
        );
        it(
            "twoChainNode3",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export default bar;
                        import bar , {a , default as c} from "./someFile.mock";
                    `,
                    "someFile.mock.d.ts": `
                        export const bar = 1;
                        export type foo = number;
                        const foo = 1;
                        export default foo;
                    `,
                },
                resolutionInformation: [
                    {
                        exposedName: "default",
                        resolutionIndex: 0,
                        statement: `
                            export type foo = number;
                        `,
                    },
                    {
                        exposedName: "default",
                        resolutionIndex: 0,
                        statement: `
                            const foo = 1;
                        `,
                    },
                ],
            })
        );
    });
});

let i = 0;
function unitTest(_: {
    fs: {
        "index.mock.d.ts": string;
        [fileName: string]: string;
    };
    /**
     * @description
     * Order should be the same as the one defined by resolve public api.
     * I could go with sort by I encountered a strange bug and gave up on it.
     */
    resolutionInformation: resolutionInformationNode[];
}): () => void {
    return (): void => {
        const paths = createFs(__dirname, { folder: String(i++), ..._ });

        const absolutePathToIndexMockDts = paths["index.mock.d.ts"];
        const firstStatementsOfIndexMockDts = getStatementsOf(absolutePathToIndexMockDts)[0];

        if (firstStatementsOfIndexMockDts === undefined) throw Error();
        //@TODO create high level assertion function for this one
        if (
            !isExportStatementChain(firstStatementsOfIndexMockDts) &&
            !isExportStatementNonChain(firstStatementsOfIndexMockDts)
        ) {
            throw Error(tagUnindent`
                The first statement of index.mock.d.ts :

                    ${printNodeObject(firstStatementsOfIndexMockDts, absolutePathToIndexMockDts)}

                has to have export modifier or be export statement chain.
            `);
        }

        const expected: resolutionInformationNode[] = resolvePublicApi({
            absolutePathToIndexDts: absolutePathToIndexMockDts,
        }).map(({ exposedName, namespace, statement, pathToTsFile, resolutionIndex }) => ({
            exposedName: (exposedName !== null ? [...namespace, exposedName] : [...namespace]).join("."),
            resolutionIndex,
            statement: format(printNodeObject(statement, pathToTsFile).trim()),
        }));

        _.resolutionInformation.forEach((node) => (node.statement = format(node.statement).trim()));

        expect(expected).toEqual(_.resolutionInformation);
    };
}

type resolutionInformationNode = {
    statement: string;
    exposedName: string | null;
    resolutionIndex: number;
};
