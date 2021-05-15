import { namedExport } from "../../types";
import { namedExportNames } from "../namedExportNames/namedExportNames";

export function getImportedNameFromExportedName(statement : namedExport,exportedName : string):string {
    const names = namedExportNames(statement)
    let toReturn : string | undefined;
    for (const {name,propertyName} of names) {
        if (name === exportedName) {
            toReturn = propertyName
        }
    }
    return toReturn ?? exportedName;
}