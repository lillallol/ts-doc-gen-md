import * as fs from "fs";
import * as path from "path";

/**
 * @description
 * Creates a file in the provided folder with name `file.mock.d.ts` that contains the provided code.
 * This function also calls `setTimeout` of `0` time that deletes the created file.
 * @returns
 * The absolute path to the created file.
 */
export function createMockFile(_: {
    /**
     * @description
     * Folder in which the file will be created.
     */
    dirname: string;
    /**
     * @description
     * The code that the file will contain.
     */
    code: string;
}): string {
    const { code, dirname } = _;
    const absolutePathToMockFile = path.resolve(dirname, "file.mock.d.ts");
    fs.writeFileSync(absolutePathToMockFile, code);
    setTimeout(() => fs.unlinkSync(absolutePathToMockFile));
    return absolutePathToMockFile;
}
