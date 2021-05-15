import { resolveNamedExportPathfullToNonDelegationExport } from "./resolveNamedExportPathfullToNonDelegationExport";
import { getStatementsOf, isNamedExportPathFull, printNodeObject } from "../../../ts-ast-utils/index";
import { createFs } from "../../../test-utils/createFs";

describe(resolveNamedExportPathfullToNonDelegationExport.name, () => {
    it(
        "resolves the named export given non zero resolution index and having to deal with delegation exports",
        unitTest({
            resolutionIndex: 1,
            statementIndex: 0,
            fs: {
                "index.mock.d.ts": `
                    export {B as b,A as a} from "./file.mock"
                `,
                "file.mock.d.ts": `
                    export * from "./right.mock";
                    export * from "./mid.mock";
                    export * from "./left.mock";
                `,
                "right.mock.d.ts": `
                    const A = 1;
                `,
                "mid.mock.d.ts": `
                    export * from "./midMidEnd.mock"
                `,
                "left.mock.d.ts": `
                    function A() {}
                `,
                "midMidEnd.mock.d.ts": `
                    export const B = 1 , A = 2;
                `,
            },
            indexes: [
                {
                    fileName: "midMidEnd.mock.d.ts",
                    statementIndex: 0,
                    resolutionIndex: 1,
                },
            ],
        })
    );
    //@TODO fix the spec
    it(
        "properly resolves ",
        unitTest({
            resolutionIndex: 1,
            statementIndex: 0,
            fs: {
                "index.mock.d.ts": `
                    export {B as b,A as a} from "./file.mock"
                `,
                "file.mock.d.ts": `
                    export const B = 1 , A = 2;
                `,
            },
            indexes: [
                {
                    fileName: "file.mock.d.ts",
                    statementIndex: 0,
                    resolutionIndex: 1,
                },
            ],
        })
    );
    //@TODO the f is thi test? Why does it pass?
    it(
        "unit test",
        unitTest({
            resolutionIndex: 2,
            statementIndex: 0,
            fs: {
                "index.mock.d.ts": `
                        export { DIC, printDependencyTree, namesFactory } from "./compositionRoot.mock";
                    `,
                "compositionRoot.mock.d.ts": `
                        import { getRegistrationOfFactory } from "./DIC/getRegistrationOf";
                        export const validateLifeCycle = validateLifeCycleFactory(logAndError);

                        export type DIC = interfaces["DIC"];
                        export const DIC: DIC = dicFactory(validateLifeCycle);
                        export const printDependencyTree: interfaces["printDependencyTree"] = printDependencyTreeFactory();
                        
                        export { namesFactory } from "./NAMES/NAMES.mock";
                    `,
            },
            indexes: [
                {
                    fileName: "compositionRoot.mock.d.ts",
                    resolutionIndex: 0,
                    statementIndex: 5,
                },
            ],
        })
    );
    it(
        "resolves both type and concretion",
        unitTest({
            resolutionIndex: 0,
            statementIndex: 0,
            fs: {
                "index.mock.d.ts": `
                        export { DIC, printDependencyTree, namesFactory } from "./compositionRoot.mock";
                    `,
                "compositionRoot.mock.d.ts": `
                        import { getRegistrationOfFactory } from "./DIC/getRegistrationOf";
                        export const validateLifeCycle = validateLifeCycleFactory(logAndError);

                        export type DIC = interfaces["DIC"];
                        export const DIC: DIC = dicFactory(validateLifeCycle);
                        export const printDependencyTree: interfaces["printDependencyTree"] = printDependencyTreeFactory();
                        
                        export { namesFactory } from "./NAMES/NAMES.mock";
                    `,
            },
            indexes: [
                {
                    fileName: "compositionRoot.mock.d.ts",
                    resolutionIndex: 0,
                    statementIndex: 2,
                },
                {
                    fileName: "compositionRoot.mock.d.ts",
                    resolutionIndex: 0,
                    statementIndex: 3,
                },
            ],
        })
    );
});

//@TODO folder name should not be chosen by the unit test writer
let folderName = 0;
function unitTest(_: {
    resolutionIndex: number;
    statementIndex: number;
    fs: {
        /**
         * @description
         * The file from which the statement of `statementIndex` and `resolutionIndex` will
         * be used by `resolveNamedExport`.
         */
        "index.mock.d.ts": string;
        /**
         * @description
         * hello world
         */
        [fileName: string]: string;
    };
    indexes: {
        fileName: string;
        statementIndex: number;
        resolutionIndex: number;
    }[];
}) {
    return () => {
        const { fs, resolutionIndex, indexes, statementIndex } = _;
        const paths = createFs(__dirname, { folder: String(folderName++), fs });
        const absolutePathToTsIndexFile = paths["index.mock.d.ts"];
        const namedStatementToResolve = getStatementsOf(absolutePathToTsIndexFile)[statementIndex];
        if (!isNamedExportPathFull(namedStatementToResolve)) throw Error();

        const toEqual = indexes.map(({ resolutionIndex, statementIndex, fileName }) => {
            const resolvedStatement = getStatementsOf(paths[fileName])[statementIndex];
            return {
                resolutionIndex,
                statement: printNodeObject(resolvedStatement, paths[fileName]),
            };
        });

        const expected = resolveNamedExportPathfullToNonDelegationExport(
            namedStatementToResolve,
            absolutePathToTsIndexFile,
            resolutionIndex
        ).map(({ absolutePathToTsFile, resolutionIndex, statement }) => ({
            resolutionIndex,
            statement: printNodeObject(statement, absolutePathToTsFile),
        }));

        expect(expected).toEqual(toEqual);
    };
}
