import {ts} from "../../ts-ast-utils/index";
import { ExportChainLeaf } from "../exportChainNode/ExportChainLeaf";
import { resolveIdentifier } from "./resolveIdentifier";

export function resolveConcretionIdentifier(absolutePathToTsFile: string, nameToSearchFor: string): ExportChainLeaf {
    return resolveIdentifier(absolutePathToTsFile, nameToSearchFor).filter(
        ({ statement: s }) =>
            !(ts.isTypeAliasDeclaration(s) || ts.isInterfaceDeclaration(s)) || ts.isImportDeclaration(s) // wtf is the  || ts.isImportDeclaration(s) for?
    )[0];
}
