
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
                    