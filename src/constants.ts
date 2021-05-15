import { firstLinesFactory } from "./es-utils/index";

const errorMessageFirstLinesNumber = 10;

export const firstLines = firstLinesFactory(errorMessageFirstLinesNumber);

export const issuesUrl: string = "https://github.com/lillallol/ts-doc-gen-md/issues";


// export const extraErrorMessageForAstFactory = (_: {
//     pathToTsFile: string;
//     astNode: ts.astNode;
//     initialStatement: exportChainLeafStatement;
// }): string => tagUnindent`
//     ast node :

//         ${[firstLines(printNodeObject(_.astNode, _.pathToTsFile))]}

//     initial statement :

//         ${[firstLines(printNodeObject(_.initialStatement, _.pathToTsFile))]}

//     absolute path to file containing ast node and initial statement :

//         ${_.pathToTsFile}
// `;
