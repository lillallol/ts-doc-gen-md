import { documentExportChainLeaf } from "./documentExportChainLeaf";
import { resolvePublicApi } from "../../ts-ast-resolve/index";
import { format } from "../format/format";
import { ExportChainLeafToNodeDocumentationOrReferenceMap } from "./ExportChainLeafToNodeDocumentationOrReferenceMap";
import { DocumentationNode } from "./DocumentationNode";
import { DocumentationReferenceNode } from "./DocumentationReferenceNode";
import { createFs } from "../../test-utils/createFs";

describe(documentExportChainLeaf.name, () => {
    describe("tests for statements", () => {
        //@TODO test an interface that extends multiple times
        describe("interface declaration", () => {
            test(
                "random test",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export interface I {
                                1 : number
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                            export interface I {
                                1 : number
                            }
                        `,
                    ],
                })
            );
            test(
                "documents properly for interfaceDeclaration that extends an identifier that is both an interface and a class",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            declare class A { constructor():void }
                            interface A {}
                            /***/
                            export declare interface foo<T> extends A {
                                /***/
                                a? : T;
                                /***/
                                b() : void;
                                c : () => void;
                                readonly d : string;
                                e : new () => {[x:string] : boolean};
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                            /***/
                            export declare interface foo<T> extends A {
                                /***/
                                a? : T;
                                /***/
                                b() : void;
                                c : () => void;
                                readonly d : string;
                                e : new () => {
                                    [x:string] : boolean
                                };
                            }
                        `,
                        `
                            interface A {}
                        `,
                        `
                            declare class A { constructor():void }
                        `,
                    ],
                })
            );
        });
        it(
            "documents properly for typeAliasDeclaration",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        /***/
                        export declare type ITypes<A> = A;
                    `,
                },
                documentedStatements: [
                    `
                        /***/
                        export declare type ITypes<A> = A;
                    `,
                ],
            })
        );
        //@TODO test for class that extends something like this : ts.A.B.C
        describe("class declaration", () => {
            //@TODO find a way to test that it does not print the private members of a class
            it(
                "does not document ES private class members",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export declare class A {
                                #prop : number;
                                constructor();
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                            export declare class A {
                                constructor();
                            }
                        `,
                    ],
                })
            );
            it(
                "does not document protected class member",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export declare class A {
                                protected a : number;
                                constructor();
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                            export declare class A {
                                constructor();
                            }
                        `,
                    ],
                })
            );
            it(
                "does not document typescript private class member",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export declare class A {
                                private a : number;
                                constructor();
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                            export declare class A {
                                constructor();
                            }
                        `,
                    ],
                })
            );
            it(
                "documents properly for class declaration that extends and implements",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            declare class B { constructor() }
                            interface C {}
                            interface D {}
                            interface F {}
                            interface priv {}
                            export declare class A<T> extends B implements C, D, F {
                                a: number;
                                b: string;
                                c = 3;
                                #d : priv;
                                constructor(t: T);
                                get method(): string;
                                set method(x: string);
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                            declare class B { constructor() }
                        `,
                        `
                            interface C {}
                        `,
                        `
                            interface D {}
                        `,
                        `
                            interface F {}
                        `,
                        `
                            export declare class A<T> extends B implements C, D, F {
                                a: number;
                                b: string;
                                c = 3;
                                constructor(t: T);
                                get method(): string;
                                set method(x: string);
                            }
                        `,
                    ],
                })
            );
            it(
                "documents properly for class declaration that extends",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            declare class B { constructor() }
                            interface B {}
                            export declare class A extends B {
                                constructor();
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                            declare class B { constructor() }
                        `,
                        `
                            export declare class A extends B {
                                constructor();
                            }
                        `,
                    ],
                })
            );
            it(
                "documents properly for class declaration that implements and one implementer corresponds to both an interface and a class",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            declare class C { constructor() }
                            interface C {}
                            interface D {}
                            interface F {}
                            export declare class A implements C, D, F {
                                constructor();
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                            declare class C { constructor() }
                        `,
                        `
                            interface C {}
                        `,
                        `
                            interface D {}
                        `,
                        `
                            interface F {}
                        `,
                        `
                            export declare class A implements C, D, F {
                                constructor();
                            }
                        `,
                    ],
                })
            );
            test(
                "temp",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export declare class A {
                                p : number;
                                c = 3
                                constructor():void
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                        export declare class A {
                            p : number;
                            c = 3
                            constructor():void
                        }
                    `,
                    ],
                })
            );
        });
        describe("variableStatement", () => {
            it(
                "documents properly the const of variableStatement",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            /***/
                            export declare const a : number;
                        `,
                    },
                    documentedStatements: [
                        `
                            /***/
                            export declare const a : number;
                        `,
                    ],
                })
            );
            it(
                "documents properly the let of variableStatement",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            /***/
                            export declare let a : number;
                        `,
                    },
                    documentedStatements: [
                        `
                            /***/
                            export declare let a : number;
                        `,
                    ],
                })
            );
            // //@TODO I have not taken into account in tests the resolution index
            // it(
            //     "documents properly for variableStatement given a 0 resolution index",
            //     unitTest({
            //         fs: {
            //             "index.mock.d.ts": `
            //                 /***/
            //                 export declare const a : number , b : string , c : boolean;
            //             `,
            //         },
            //         documentedStatements: [
            //             `
            //                 /***/
            //                 export declare const a : number , b : string , c : boolean;
            //             `,
            //         ],
            //     })
            // );
            it(
                "documents properly for variableStatement given a non 0 resolution index",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            /***/
                            export declare const a : number , b : string  , c : boolean;
                        `,
                    },
                    documentedStatements: [
                        `
                            /***/
                            export declare const a : number;
                        `,
                        `
                            export declare const b : string;
                        `,
                        `
                            export declare const c : boolean;
                        `,
                    ],
                })
            );
            it(
                "documents properly for variableStatement with no type but initial value number",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            /***/
                            export declare const a = 1;
                        `,
                    },
                    documentedStatements: [
                        `
                            /***/
                            export declare const a = 1;
                        `,
                    ],
                })
            );
            it(
                "documents properly for variableStatement with no type but initial value string",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            /***/
                            export declare const a = "1";
                        `,
                    },
                    documentedStatements: [
                        `
                            /***/
                            export declare const a = "1";
                        `,
                    ],
                })
            );
            it(
                "documents properly for variableStatement with no type but initial value true",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            /***/
                            export declare const a = true;
                        `,
                    },
                    documentedStatements: [
                        `
                            /***/
                            export declare const a = true;
                        `,
                    ],
                })
            );
            it(
                "documents properly for variableStatement with no type but initial value false",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            /***/
                            export declare const a = false;
                        `,
                    },
                    documentedStatements: [
                        `
                            /***/
                            export declare const a = false;
                        `,
                    ],
                })
            );
            it(
                "documents properly for variable with value class",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export declare const A : {
                                new (): {}
                            };
                        `,
                    },
                    documentedStatements: [
                        `
                            export declare const A : {
                                new (): {}
                            };
                        `,
                    ],
                })
            );
            it(
                "documents properly for variable with value function",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export declare const A: <T>() => void
                        `,
                    },
                    documentedStatements: [
                        `
                            export declare const A: <T>() => void
                        `,
                    ],
                })
            );
            it(
                "documents properly for variableStatement with no type but initial value symbol",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            /***/
                            export declare const a : unique symbol;
                        `,
                    },
                    documentedStatements: [
                        `
                            /***/
                            export declare const a : unique symbol;
                        `,
                    ],
                })
            );
        });
        it(
            "documents properly for function declaration",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        /***/
                        export declare function foo<
                            T extends {
                                [x: string]: number}
                        >(
                            { a, b }: {
                                /***/
                                a?: string | undefined;
                                b?: number | undefined;
                            } | undefined,
                            A: boolean,
                            x?: T,
                            ...xx: unknown[]
                        ): A is true;
                    `,
                },
                documentedStatements: [
                    `
                        /***/
                        export declare function foo<
                            T extends {
                                [x: string]: number}
                        >(
                            { a, b }: {
                                /***/
                                a?: string | undefined;
                                b?: number | undefined;
                            } | undefined,
                            A: boolean,
                            x?: T,
                            ...xx: unknown[]
                        ): A is true;
                    `,
                ],
            })
        );
        it(
            "documents properly for enumeration declaration",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                    export declare enum Country {
                        Germany = 0,
                        Sweden = 1,
                        USA = 2
                    }
                `,
                },
                documentedStatements: [
                    `
                    export declare enum Country {
                        Germany = 0,
                        Sweden = 1,
                        USA = 2
                    }
                `,
                ],
            })
        );
    });
    describe("tests for non circular type references", () => {
        it(
            "adds in type references the referenced type that exist in the same file",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare const DIC: IDic;
                        type IDic = number;
                    `,
                },
                documentedStatements: [
                    `
                        export declare const DIC: IDic;
                    `,
                    `
                        type IDic = number;
                    `,
                ],
            })
        );
        it(
            `adds in type references the referenced type that is imported via an import statement`,
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        import { ITypes } from "./types.mock";
                        export declare const namesFactory : ITypes;
                    `,
                    "types.mock.d.ts": `
                        export declare type ITypes = number;
                    `,
                },
                documentedStatements: [
                    `
                        export declare const namesFactory : ITypes;
                    `,
                    `
                        export declare type ITypes = number;
                    `,
                ],
            })
        );
        //@TODO make a test where one such build in type is confusingly used as a user defined type function
        it(
            "does not add the type reference that is build-in in the referenced types",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare type obj = Map<symbol, unknown>;
                    `,
                },
                documentedStatements: [
                    `
                        export declare type obj = Map<symbol, unknown>;
                    `,
                ],
            })
        );
        it(
            "adds in type references the referenced type that is imported via an import expression",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare const DIC: import("./types.mock").IDic;
                    `,
                    "types.mock.d.ts": `
                        export declare type IDic = {
                            a: string;
                        };
                    `,
                },
                documentedStatements: [
                    `
                        export declare const DIC: IDic;
                    `,
                    `
                        export declare type IDic = {
                            a: string;
                        };
                    `,
                ],
            })
        );
        it(
            "adds recursively type references if needed",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare const DIC: import("./types.mock").IDic;
                    `,
                    "types.mock.d.ts": `
                        type IAbstraction = symbol;
                        export declare type IDic = {
                            a: IAbstraction;
                        };
                    `,
                },
                documentedStatements: [
                    `
                        export declare const DIC: IDic;
                    `,
                    `
                        export declare type IDic = {
                            a: IAbstraction;
                        };
                    `,
                    `
                        type IAbstraction = symbol;
                    `,
                ],
            })
        );
        test(
            "adds in type references a type that is dotted once from an ecmascript namespace module",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        import * as ts from "./somewhere.mock";
                        export interface I {
                            prop: ts.C;
                        }
                    `,
                    "somewhere.mock.d.ts": `
                        export {C} from "node-module";
                        export {A} from "node-module";
                    `,
                },
                documentedStatements: [
                    `
                        export interface I {
                            prop: ts.C;
                        }
                    `,
                    `
                        export {C} from "node-module";
                    `,
                ],
            })
        );
        test(
            "adds in type references a type that is dotted twice from an ecmascript namespace module",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        import * as ts from "./somewhere.mock";
                        export interface I {
                            prop: ts.C.D;
                        }
                    `,
                    "somewhere.mock.d.ts": `
                        export * as C from "./someplace.mock";
                        export {A} from "node-module";
                    `,
                    "someplace.mock.d.ts": `
                        export type D = number;
                    `,
                },
                documentedStatements: [
                    `
                        export interface I {
                            prop: ts.C.D;
                        }
                    `,
                    `
                        export type D = number;
                    `,
                ],
            })
        );
        test(
            "adds in type references a type that is dotted once from an ecmascript namespace module and once from a namespace import from node module",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        import * as ts from "./somewhere.mock";
                        export interface I {
                            prop: ts.C.D;
                        }
                    `,
                    "somewhere.mock.d.ts": `
                        export * as C from "node-module";
                        export {A} from "node-module";
                    `,
                },
                documentedStatements: [
                    `
                        export interface I {
                            prop: ts.C.D;
                        }
                    `,
                    `
                        export * as C from "node-module";
                    `,
                ],
            })
        );
    });
    describe("tests for type references that circularly reference themselves", () => {
        it(
            " exported from the entry point",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare type treeNode<V> = {
                            parent: treeNode<V>;
                            left: treeNode<V>;
                            right: treeNode<V>;
                            value: V;
                        };
                    `,
                },
                documentedStatements: [
                    `
                        export declare type treeNode<V> = {
                            parent: treeNode<V>;
                            left: treeNode<V>;
                            right: treeNode<V>;
                            value: V;
                        };
                    `,
                ],
            })
        );
        it(
            "does not replace types that are imported and circularly reference themselves in their definition",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare const DIC: import("./types.mock").IDic;
                    `,
                    "types.mock.d.ts": `
                        export declare type IDic = {
                            a: string;
                            b : IDic;
                        };
                    `,
                },
                documentedStatements: [
                    `
                        export declare const DIC: IDic;
                    `,
                    `
                        export declare type IDic = {
                            a: string;
                            b : IDic;
                        };
                    `,
                ],
            })
        );
        // test.todo(
        //     "documents only the part that is needed from a type, even when parts need to be merged",
        //     unitTest({
        //         fs: {
        //             "index.mock.d.ts": `
        //                 export type _A = number;
        //                 export type _B = string;
        //                 export type _C = boolean;
        //                 interface ts {
        //                     A : {
        //                         B : ts["B"]["D"],
        //                         C : string
        //                     },
        //                     B : {
        //                         E : string;
        //                         D : _A | _C;
        //                     }
        //                 }
        //                 export declare type AA = ts["A"]["B"];
        //             `,
        //         },
        //         documentedStatements: [
        //             `
        //                 export type A = number;
        //             `,
        //             `
        //                 interface ts {
        //                     A : {
        //                         B : A,
        //                         C : string
        //                     },
        //                     B : B
        //                 }
        //             `,
        //             `
        //                 export declare type AA = ts["A"]["B"];
        //             `,
        //         ],
        //         resolutionIndex: 0,
        //         statementIndex: 4,
        //     })
        // );
    });
    describe("tests for ts ast nodes", () => {
        test(
            "array type with triple dot operator",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export type contextIndexToParentIndexReturnType = [null,...number[]];
                    `,
                },
                documentedStatements: [
                    `
                        export type contextIndexToParentIndexReturnType = [null,...number[]];
                    `,
                ],
            })
        );
        //@TODO test that importTypeNode is printed without import
        test(
            "constructorTypeNode",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare const DIC: new () => {
                            a : number
                        };
                    `,
                },
                documentedStatements: [
                    `
                        export declare const DIC: new () => {
                            a : number
                        };
                    `,
                ],
            })
        );
        test(
            "dictionaryType",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare type ITypes = {
                            [x:string] : number
                        };
                    `,
                },
                documentedStatements: [
                    `
                        export declare type ITypes = {
                            [x:string] : number
                        };
                    `,
                ],
            })
        );
        //@TODO here I should index access type that has starting type reference that has type parameters
        describe("index access type or type reference", () => {
            test(
                "type reference",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                        type A = number;
                        export declare type B = A;
                    `,
                    },
                    documentedStatements: [
                        `
                        type A = number;
                    `,
                        `
                        export declare type B = A;
                    `,
                    ],
                })
            );
            test(
                "user defined type reference with type parameters",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                        type A<T,F> = T | F;
                        export declare type B = A<number,string>;
                    `,
                    },
                    documentedStatements: [
                        `
                        type A<T,F> = T | F;
                    `,
                        `
                        export declare type B = A<number,string>;
                    `,
                    ],
                })
            );
            test(
                "built in type reference with type parameters",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            import { B } from "./somewhere.mock";
                            import { A } from "./somewhere.mock";
                            export declare type myType = {
                                prop: Map<A, B>;
                            };
                        `,
                        "somewhere.mock.d.ts": `
                            export declare type A = number;
                            export declare type B = string;
                        `,
                    },
                    documentedStatements: [
                        `
                            export declare type A = number;
                        `,
                        `
                            export declare type B = string;
                        `,
                        `
                            export declare type myType = {
                                prop: Map<A, B>;
                            };
                        `,
                    ],
                })
            );
            //@TODO test generic with type reference that
            test(
                "index access type without qualifiers",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            type interfaces = {
                                A : {
                                    B : {
                                        C : number
                                    }
                                }
                            };
                            export declare const A: interfaces["A"]["B"]["C"];
                        `,
                    },
                    documentedStatements: [
                        `
                            export declare const A: interfaces["A"]["B"]["C"];
                        `,
                        `
                            type interfaces = {
                                A : {
                                    B : {
                                        C : number
                                    }
                                }
                            };
                        `,
                    ],
                })
            );
            test(
                "typeof with index access type",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                        declare const obj: {
                            A: {
                                B: {
                                    C1: {
                                        D: number;
                                    };
                                    C2: {
                                        D: string;
                                    };
                                };
                            };
                        };
                        declare type C = "C1" | "C2";
                        export declare type A = typeof obj.A.B[C]["D"];
                    `,
                    },
                    documentedStatements: [
                        `
                            declare const obj: {
                                A: {
                                    B: {
                                        C1: {
                                            D: number;
                                        };
                                        C2: {
                                            D: string;
                                        };
                                    };
                                };
                            };
                        `,
                        `
                            declare type C = "C1" | "C2";
                        `,
                        `
                            export declare type A = typeof obj.A.B[C]["D"];
                        `,
                    ],
                })
            );
            //@TODO
            // test(
            //     "index type with qualifiers",
            //     unitTest({
            //         fs: {
            //             "index.mock.d.ts": `
            //             `,
            //         },
            //         documentedStatements: [],
            //     })
            // );

            test(
                "index type with qualifiers and type parameters",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                        interface Page {
                            goto : (x : string,y : number) => void
                        }
                        export interface foo {
                            options?: NonNullable<Parameters<Page["goto"]>[1]>;
                        }
                    `,
                    },
                    documentedStatements: [
                        `
                        export interface foo {
                            options?: NonNullable<Parameters<Page["goto"]>[1]>;
                        }
                    `,
                        `
                        interface Page {
                            goto : (x : string,y : number) => void
                        }
                    `,
                    ],
                })
            );
            describe("part", () => {
                test(
                    "random test 3",
                    unitTest({
                        fs: {
                            "index.mock.d.ts": `
                                import * as ts from "node-module";
                                export declare type non = ts.FunctionDeclaration.SomeProp;
                            `,
                        },
                        documentedStatements: [
                            `
                                import * as ts from "node-module";
                            `,
                            `
                                export declare type non = ts.FunctionDeclaration.SomeProp;
                            `,
                        ],
                    })
                );
                test(
                    "random test 4",
                    unitTest({
                        fs: {
                            "index.mock.d.ts": `
                                import * as ts from "./somewhere.mock";
                                export declare type non = ts.A;
                            `,
                            "somewhere.mock.d.ts": `
                                export {A,B} from "node-module";
                            `,
                        },
                        documentedStatements: [
                            `
                                export {A} from "node-module";
                            `,
                            `
                                export declare type non = ts.A;
                            `,
                        ],
                    })
                );
            });
        });
        describe("typeof", () => {
            test(
                "only single identifier",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            import type * as fs from "fs";
                            export declare type fn = typeof fs;
                        `,
                    },
                    documentedStatements: [
                        `
                            import type * as fs from "fs";
                        `,
                        `
                            export declare type fn = typeof fs;
                        `,
                    ],
                })
            );
            test(
                "only qualifiers",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            declare const obj: {
                                A: {
                                    B: {
                                        C: number;
                                    };
                                };
                            };
                            export declare type A = typeof obj.A.B.C;
                        `,
                    },
                    documentedStatements: [
                        `
                            declare const obj: {
                                A: {
                                    B: {
                                        C: number;
                                    };
                                };
                            };
                        `,
                        `
                            export declare type A = typeof obj.A.B.C;
                        `,
                    ],
                })
            );
        });
        describe("static keyword", () => {
            test(
                "in class methods",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export declare class A {
                                constructor();
                                static s(): void;
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                            export declare class A {
                                constructor();
                                static s(): void;
                            }
                        `,
                    ],
                })
            );
            test(
                "in class properties",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export declare class A {
                                static a : number;
                                constructor();
                            }
                        `,
                    },
                    documentedStatements: [
                        `
                            export declare class A {
                                static a : number;
                                constructor();
                            }
                        `,
                    ],
                })
            );
        });
        test(
            "parenthesized type",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare type a = (number|string);
                    `,
                },
                documentedStatements: [
                    `
                        export declare type a = (number|string);
                    `,
                ],
            })
        );
        //@TODO have to think a little bit more about these tests
        describe("import statement", () => {
            test(
                "using only default of default+namespace import",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export default foo;
                            import foo, * as ts from "node-module";
                        `,
                    },
                    documentedStatements: [
                        `
                            import foo from "node-module";
                        `,
                    ],
                })
            );
            test(
                "using only namespace of default+namespace import",
                unitTest({
                    fs: {
                        "index.mock.d.ts": `
                            export default ts;
                            import foo, * as ts from "node-module";
                        `,
                    },
                    documentedStatements: [
                        `
                            import * as ts from "node-module";
                        `,
                    ],
                })
            );
        });
    });
    describe("random tests that I have not yet categorized properly with the other tests", () => {
        test(
            "random test 0",
            unitTest({
                fs: {
                    "index.mock.d.ts": `
                        export declare type $ElementType<T extends { [P in K & any]: any; }, K extends keyof T | number> = T[K];
                    `,
                },
                documentedStatements: [
                    `
                        export declare type $ElementType<T extends { [P in K & any]: any; }, K extends keyof T | number> = T[K];
                    `,
                ],
            })
        );
        // describe(toDocText.name, () => {
        //     describe("random tests", () => {
        //         test(
        //             "TODO",
        //             unitTest({
        //                 fs: {
        //                     "index.mock.d.ts": `
        //                         interface AA<A,B> {}
        //                         export interface A<B,C> extends AA<A,B> {
        //                             _index: number;
        //                         }
        //                     `,
        //                 },
        //                 statementIndex: 1,
        //                 resolutionIndex: 0,
        //                 documentedStatementsAsDocText: [
        //                     `
        //                         interface AA<A,B> {}
        //                     `,
        //                     `
        //                         export interface A<B,C> extends AA<A,B> {
        //                             _index: number;
        //                         }
        //                     `,
        //                 ],
        //             })
        //         );
        //     });
        // });
    });
});

/**
 * @description
 * For every test, a folder is created. Every folder name is saved in this singleton so
 * that if a collision will happen an error will be thrown.
 */
const folderHasBeenCreatedAlready: { [folderName: string]: boolean } = {};
let folderIndex = 0;
function unitTest(parameters: {
    /**
     * @description
     * The keys of this object literal will be created as files with their corresponding values as content.
     */
    fs: {
        /**
         * @description
         * The file for which the public api will be documented.
         */
        "index.mock.d.ts": string;
        [fileName: string]: string;
    };
    /**
     * @description
     * An array containing the string representation (without the html) of the documented statements.
     * The order has to be the same as the order of documentation.
     */
    documentedStatements: string[];
}): () => void {
    return () => {
        const { fs, documentedStatements } = parameters;

        const folderName = "test" + folderIndex++;
        if (folderHasBeenCreatedAlready[folderName]) throw Error(folderName);
        folderHasBeenCreatedAlready[folderName] = true;

        const paths = createFs(__dirname, { folder: folderName, fs });
        const absolutePathToMockIndexFile = paths["index.mock.d.ts"];

        const exportChainLeafs = resolvePublicApi({
            absolutePathToIndexDts: absolutePathToMockIndexFile,
        });

        const exportChainLeafToDocumentationNodeMap = new ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationNode>();
        const exportChainLeafToDocumentationReferenceNodeMap = new ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationReferenceNode>();

        exportChainLeafs.forEach((exportChainLeaf) =>
            documentExportChainLeaf({
                exportChainLeaf,
                exportChainLeafToDocumentationNodeMap,
                exportChainLeafToDocumentationReferenceNodeMap,
            })
        );

        const toCompare: string[] = [
            ...exportChainLeafToDocumentationNodeMap.values().map(({ docText }) => docText),
            ...exportChainLeafToDocumentationReferenceNodeMap.values().map(({ docText }) => docText),
        ];

        // console.log(toCompare);
        expect(toCompare.sort()).toEqual(documentedStatements.map((l) => format(l).trim()).sort());
    };
}
