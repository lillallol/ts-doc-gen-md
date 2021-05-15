
                        import { getRegistrationOfFactory } from "./DIC/getRegistrationOf";
                        export const validateLifeCycle = validateLifeCycleFactory(logAndError);

                        export type DIC = interfaces["DIC"];
                        export const DIC: DIC = dicFactory(validateLifeCycle);
                        export const printDependencyTree: interfaces["printDependencyTree"] = printDependencyTreeFactory();
                        
                        export { namesFactory } from "./NAMES/NAMES.mock";
                    