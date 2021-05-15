import * as fs from "fs";
import * as path from "path";
import { isModuleSpecifierOfNodeModule } from "../isAssertions/isModuleSpecifierOfNodeModule/isModuleSpecifierOfNodeModule";
import { delegationExportStatement, importStatement, namedExportPathFull, namespaceExportStatement } from "../types";

/**
 * @description
 * If the module specifier:
 * * is a module name then it returns the module name
 * * points to a folder it returns the absolute path to the `index.d.ts` file of that folder
 * * points to a file it returns the absolute path to the `d.ts` file that the module specifier points to
 */
export function absolutePathFromImportExportPathFull(
    absolutePathToTsFileContainingStatement: string,
    exportOrImport: namespaceExportStatement | delegationExportStatement | namedExportPathFull | importStatement
): string {
    const { text } = exportOrImport.moduleSpecifier;
    if (isModuleSpecifierOfNodeModule(text)) {
        return text;
    }
    /**
     * @description
     * Sometimes someone can import from a folder:
     * ```ts
     * import {something} from "path/to/folder";
     * ```
     * which is equivalent to:
     * ```ts
     * import {something} from "path/to/folder/index";
     * ```
     * The purpose of the following code is to return the absolute path to the index file for both cases.
     */
    const candidatePathToFolderThatHasIndexFile = path.resolve(absolutePathToTsFileContainingStatement, "../", text);
    const toReturnIfPathToFolder = path.resolve(absolutePathToTsFileContainingStatement, "../", text, "index.d.ts");
    const toReturnIfPathToFile = path.resolve(absolutePathToTsFileContainingStatement, "../", text + ".d.ts");
    try {
        fs.accessSync(candidatePathToFolderThatHasIndexFile);
        return toReturnIfPathToFolder;
    } catch {
        return toReturnIfPathToFile;
    }
}
