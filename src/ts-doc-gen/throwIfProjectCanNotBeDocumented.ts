import {
    absolutePathFromImportExportPathFull,
    getStatementsOf,
    isInvalidStatement,
    isModuleSpecifierOfNodeModule,
    isPathFullImportExport,
} from "../ts-ast-utils/index";

import { errorMessages } from "../errorMessages";

/**
 * @todo
 * test that for the typescript module because it does not throw error
 */
export function throwIfProjectCanNotBeDocumented(absolutePathToEntryPointDtsFile: string): void {
    // for any case of circularity
    const alreadyTestedPaths: Set<string> = new Set();

    (function recurse(paths: string[]): void {
        paths.forEach((path) => {
            if (!alreadyTestedPaths.has(path)) {
                if (getStatementsOf(path).some(isInvalidStatement)) {
                    throw Error(errorMessages.projectContainsStatementThatCanBeDocumented(path));
                }
                alreadyTestedPaths.add(path);
                recurse(getNonNodeModulePathsOf(path));
            }
        });
    })([absolutePathToEntryPointDtsFile]);
}

function getNonNodeModulePathsOf(absolutePathToDtsFile: string): string[] {
    return getStatementsOf(absolutePathToDtsFile)
        .filter(isPathFullImportExport)
        .filter((s) => !isModuleSpecifierOfNodeModule(s.moduleSpecifier.text))
        .map((s) => absolutePathFromImportExportPathFull(absolutePathToDtsFile, s));
}
