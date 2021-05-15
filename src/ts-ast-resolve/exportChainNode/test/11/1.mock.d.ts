
                        export declare const a = 1, b = 2;
                        export declare function foo():void;
                        export class A { constructor() {}}
                        export declare type obj = {}
                        export interface I {}

                        export * as ts from "typescript";
                        export * from "lodash";
                        export {AA,b as BB, default as CC, default} from "node-module";

                        declare const shouldBeIgnored = null;
                    