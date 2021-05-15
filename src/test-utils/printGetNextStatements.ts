import { tagUnindent } from "../es-utils/index";
import { printNodeObject } from "../ts-ast-utils/index";
import { getNextStatementsReturnTypeElement } from "../ts-ast-resolve/exportChainNode/ExportChainNode";

export function printGetNextStatements(_: getNextStatementsReturnTypeElement[]): string {
    return (
        "Next Statements\n" +
        _.map(
            ({ newPath, newStatement }) => tagUnindent`
            path : ${newPath}
            statement :
                ${printNodeObject(newStatement, newPath)}
        `
        ).join("\n")
    );
}
