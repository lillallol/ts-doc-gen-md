
                            declare const obj: {
                                A: {
                                    B: {
                                        C: number;
                                    };
                                };
                            };
                            export declare type A = typeof obj.A.B.C;
                        