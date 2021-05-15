
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
                        