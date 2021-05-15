import { namedExportNames } from "../namedExportNames/namedExportNames";
import { namedExport } from "../../types";

export function getNamesFromNamedExportStatement(s: namedExport): string[] {
    return namedExportNames(s).map(({ name }) => name);
}
