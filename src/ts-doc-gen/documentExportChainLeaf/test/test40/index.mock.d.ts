
                        interface Page {
                            goto : (x : string,y : number) => void
                        }
                        export interface foo {
                            options?: NonNullable<Parameters<Page["goto"]>[1]>;
                        }
                    