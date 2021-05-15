
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
                    