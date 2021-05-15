import * as path from "path";
import * as fs from "fs";

export function createFs(
    dirname: string,
    _: { folder: string; fs: { [fileName: string]: string } }
): { [fileName: string]: string } {
    const absolutePathToTestFolder = path.resolve(dirname,"test" ,_.folder);
    const fileNameIndexToAbsolutePath: { [fileName: string]: string } = {};
    try {
        fs.rmSync(absolutePathToTestFolder, { recursive: true });
    } catch {
        // console.log(e);
    }
    fs.mkdirSync(absolutePathToTestFolder,{recursive : true});
    Object.entries(_.fs).forEach(([fileName, code]) => {
        const absolutePathToTsFile = path.resolve(absolutePathToTestFolder,fileName);
        fileNameIndexToAbsolutePath[fileName] = absolutePathToTsFile;
        fs.mkdirSync(path.parse(absolutePathToTsFile).dir, { recursive: true });
        fs.writeFileSync(absolutePathToTsFile, code);
    });
    return fileNameIndexToAbsolutePath;
}
