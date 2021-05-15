
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
                    