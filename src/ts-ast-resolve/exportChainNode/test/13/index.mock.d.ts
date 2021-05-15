
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
                    