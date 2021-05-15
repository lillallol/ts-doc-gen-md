
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
                        