import * as fs from "fs";
import * as path from "path";
import * as ts from "../adapters/typescript";

/**
 * @description
 * It returns the ast of the file that corresponds to the provided path.
 * It memoizes that the given path corresponds to the returned ast, so that
 * the next time that the ast of the same path is required it does not need
 * to create it again.
 */
export function getSourceFileOf(absolutePathToFile: string): ts.SourceFile {


    if (pathToSourceFile[absolutePathToFile] !== undefined) return pathToSourceFile[absolutePathToFile];

    const code: string = fs.readFileSync(absolutePathToFile, {
        encoding: "utf-8",
    });

    const { name: fileName } = path.parse(absolutePathToFile);

    const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest);
    pathToSourceFile[absolutePathToFile] = sourceFile;

    return sourceFile;
}

const pathToSourceFile: { [path: string]: ts.SourceFile } = {};
