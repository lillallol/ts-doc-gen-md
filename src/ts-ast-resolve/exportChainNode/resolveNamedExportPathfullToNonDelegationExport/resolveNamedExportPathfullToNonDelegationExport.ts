import {
    absolutePathFromImportExportPathFull,
    namedExportNames,
    getDelegationExportStatementsOf,
    getExportStatementsOfNameOf,
    isModuleSpecifierOfNodeModule,
    exportStatement,
    namedExportPathFull,
    importStatement,
    isImportStatement,
    getNamesFromImportStatement,
} from "../../../ts-ast-utils/index";

/**
 * @description
 * Find the non delegation export that corresponds to the provided named export ??or default export chain??.
 *
 * ```ts
 * export {A} from "./some/where";
 * // ./some/where
 * export * from "./some/where1";
 * export * from "./some/where2";
 * // ./some/where2
 * export function A() {}
 * // ./some/where1
 * //nothing
 * ```
 *
 * @todo
 * ```ts
 * import {foo} from "./some/where";
 * export default foo;
 * // ./some/where
 * export * from "./some/where1";
 * export * from "./some/where2";
 * // ./some/where2
 * export function A() {}
 * // ./some/where1
 * //nothing
 * ```
 *
 * @todo
 * there are cases that it has to return a delegation export
 * @todo
 * have to test that it returns firstNodeModulesRes
 */
export function resolveNamedExportPathfullToNonDelegationExport(
    statement: namedExportPathFull | importStatement,
    absolutePathToFileContainingStatement: string,
    resolutionIndex: number
): toReturn[] {
    //@TODO add a function that throws if nameToSearchFor is missing from s
    const nameToSearchFor = (() => {
        const { name, propertyName } = isImportStatement(statement)
            ? getNamesFromImportStatement(statement)[resolutionIndex]
            : namedExportNames(statement)[resolutionIndex];
        return propertyName ?? name;
    })();
    const res: toReturn[] = [];
    
    const firstNodeModulesRes: toReturn[] = [];
    let addNodeModules = true;
    (function recurse(absolutePathToTsFile: string): void {
        if (res.length < 2) {
            {
                const _res = getExportStatementsOfNameOf(absolutePathToTsFile, nameToSearchFor);
                if (_res.length !== 0) {
                    _res.forEach(({ resolutionIndex, exportStatement }) => {
                        res.push({
                            statement: exportStatement,
                            resolutionIndex,
                            absolutePathToTsFile: absolutePathToTsFile,
                        });
                    });
                }
            }
            {
                const nonNodeModuleDelegationExports = getDelegationExportStatementsOf(absolutePathToTsFile).filter(
                    ({ moduleSpecifier }) => !isModuleSpecifierOfNodeModule(moduleSpecifier.text)
                );
                const nodeModuleDelegationExports = getDelegationExportStatementsOf(
                    absolutePathToTsFile
                ).filter(({ moduleSpecifier }) => isModuleSpecifierOfNodeModule(moduleSpecifier.text));
                if (nodeModuleDelegationExports.length > 0 && addNodeModules) {
                    firstNodeModulesRes.push(
                        ...nodeModuleDelegationExports.map<toReturn>((s) => ({
                            absolutePathToTsFile,
                            resolutionIndex: 0,
                            statement: s,
                        }))
                    );
                    addNodeModules = false;
                }
                for (const delegationExport of nonNodeModuleDelegationExports) {
                    if (res.length < 2) {
                        const newNewPath = absolutePathFromImportExportPathFull(absolutePathToTsFile, delegationExport);
                        recurse(newNewPath);
                    } else {
                        return;
                    }
                }
            }
        }
    })(absolutePathFromImportExportPathFull(absolutePathToFileContainingStatement, statement));
    if (res.length === 2 || firstNodeModulesRes.length === 0) return res;
    throw Error();//@TODO
}

type toReturn = { statement: exportStatement; absolutePathToTsFile: string; resolutionIndex: number };
