import { ts, isExportStatementChain } from "../../ts-ast-utils/index";
import { ExportChainLeaf } from "../exportChainNode/ExportChainLeaf";
import { ExportChainNode } from "../exportChainNode/ExportChainNode";

export function resolveIdentifier(absolutePathToTsFile: string, nameToSearchFor: string): ExportChainLeaf[] {
    //I treat as default export nameToSearchFor
    //@TODO that is an ugly and hacky solution that I do not know if will work properly
    const s = ts.createSourceFile(absolutePathToTsFile, `export default ${nameToSearchFor}`, ts.ScriptTarget.Latest)
        .statements[0];
    if (!isExportStatementChain(s)) throw Error();//@TODO
    return new ExportChainNode({
        statement: s,
        pathToTsFile: absolutePathToTsFile,
        exportedName: nameToSearchFor,
        exposedName: "default",
        namespace: [],
        shouldDecompose: false,
        importedName: nameToSearchFor,
    }).resolve();
}
