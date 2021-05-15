import {
    exportStatementChain,
    exportStatement,
    importStatement,
    ts,
    isDelegationExport,
    isNamedExportPathFull,
    isExportStatementNonChain,
    defaultExportLiteralNotSupported,
    getNamesFromVariableStatement,
    getNameFromNamespaceExport,
    namedExportNames,
    isNamespaceExport,
    getNamesFromNamedExportStatement,
    isDefaultExportChain,
    getNameFromDefaultExportChain,
    isDefaultExportNonChain,
    getImportStatementOfNameOf,
    absolutePathFromImportExportPathFull,
    getExportStatementsOf,
    getExportStatementsOfNameOf,
    getImportedNameFromExportedName,
    getExportStatementsNonChainOfNameOf,
    printNodeObject,
    getNamesFromNonChainExport,
    hasExportModifier,
    isNamedExportPathless,
    isExportStatementChain,
    isNamedExport,
    isModuleSpecifierOfNodeModule,
    isImportStatement,
    getNamesFromImportStatement,
} from "../../ts-ast-utils/index";
import { resolveNamedExportPathfullToNonDelegationExport } from "./resolveNamedExportPathfullToNonDelegationExport/resolveNamedExportPathfullToNonDelegationExport";
import { tagUnindent } from "../../es-utils/index";
import { ExportChainLeaf } from "./ExportChainLeaf";
import { exportChainLeafStatement } from "../types";
// import { printArrayOfExportNode } from "../../test-utils/printArrayOfExportNode";
// import { printGetNextStatements } from "../../test-utils/testUtils/printGetNextStatements";

//@TODO find a way to make that a parameter
// const printHelpMessages = false;

/**
 * @description
 * An export chain node has all the information, but also all the methods needed to get all its
 * next export chain nodes.
 */
export class ExportChainNode {
    /**
     * @description
     * The export statement that corresponds to the context export chain node.
     */
    statement: exportStatementChain | importStatement;
    /**
     * @description
     * Absolute path to the ts file that contains the context export statement.
     */
    pathToTsFile: string;
    /**
     * @description
     * The name that will be exposed to the documentation for the resolved export of the context chain node.
     *
     * It is `undefined` only if the chain has encountered so far delegation or namespace exports.
     *
     * During resolution it might have to be moved to `namespace` if it is eventually realized that it is
     * a namespace.
     */
    exposedName: string | undefined;
    /**
     * @description
     * The namespace that will be exposed to the documentation for the resolved non chain export.
     * The array is needed because multiple namespaces may be encountered during the export chain
     * resolution.
     */
    namespace: string[];
    /**
     * @description
     * ```ts
     * export * from "./some/where"; // undefined
     * export {a as A} from "./some/where"; // "A"
     * export * as a from "./some/where"; // "a"
     * export default foo; // "foo" , if it corresponds to an import statement the value should not change, because it will enable finding the resolution index of the import statement for the node module case
     * ```
     * Every `exportedName` from named export or default export chain is a candidate namespace name.
     * Delegation exports just pass the `exposedName` to the new node. // I am not so sure about this sentence
     * Namespace exports undefine it and move it to `namespace` array.
     */
    exportedName: string | undefined;
    /**
     * @description
     * ```ts
     * export * from "./some/where"; // undefined (I am not so sure about it)
     * export {a as A} from "./some/where"; // "a"
     * export * as a from "./some/where"; // "a"
     * export default foo; // "foo" and then for the case of import statement it becomes propertyName ?? name of the import statement
     * ```
     */
    importedName: string | undefined;
    /**
     * @description
     *
     * d = delegation export
     * n = namespace export
     * ^ = start of the export chain
     * . = export chain statement
     *
     * A predicate on whether the next named export should create export branches for each variable it exports.
     *
     * Only d and n can have `true` should decompose, and that only in the following cases :
     * ```text
     * ^ d+
     * ^ .* nd*
     * ```
     */
    shouldDecompose: boolean;

    constructor(_: {
        statement: exportStatementChain | importStatement;
        pathToTsFile: string;
        exposedName: string | undefined;
        namespace: string[];
        exportedName: string | undefined;
        importedName: string | undefined;
        shouldDecompose: boolean;
    }) {
        const { namespace, exposedName, pathToTsFile, statement, exportedName, shouldDecompose, importedName } = _;

        this.pathToTsFile = pathToTsFile;
        this.statement = statement;
        this.exposedName = exposedName;
        this.namespace = namespace;
        this.exportedName = exportedName;
        this.shouldDecompose = shouldDecompose;
        this.importedName = importedName;
    }

    /**
     * @todo
     * the returned type can be `ExportChainLeaf[]` xor `ExportChainNode[]` depending on the
     * provided `statement`, but I do not know how to type it properly.
     * @todo
     * Why I do not separate that into its own function?
     */
    static createInitialNode(
        /**
         * @description
         * Export statement for which the chain node is created.
         */
        statement: exportStatement,
        /**
         * @description
         * Absolute path to the ts file that contains the statement.
         */
        pathToTsFile: string
    ): (ExportChainLeaf | ExportChainNode)[] {
        const nodesToReturn: (ExportChainLeaf | ExportChainNode)[] = [];
        if (isExportStatementNonChain(statement) && hasExportModifier(statement)) {
            if (isDefaultExportNonChain(statement)) {
                throw Error(defaultExportLiteralNotSupported(statement, pathToTsFile));
            }
            if (ts.isVariableStatement(statement)) {
                getNamesFromVariableStatement(statement).forEach((exposedName, i) =>
                    nodesToReturn.push(
                        new ExportChainLeaf({
                            statement,
                            pathToTsFile,
                            exposedName,
                            namespace: [],
                            resolutionIndex: i,
                        })
                    )
                );
                // printHelpForCreatedNodes("isVariableStatement", nodesToReturn);
                return nodesToReturn;
            }

            nodesToReturn.push(
                new ExportChainLeaf({
                    statement,
                    pathToTsFile,
                    exposedName: getNamesFromNonChainExport(statement)[0],
                    namespace: [],
                    resolutionIndex: 0,
                })
            );
            // printHelpForCreatedNodes("isNonChainExportStatement", nodesToReturn);
            return nodesToReturn;
        }

        if (isDefaultExportChain(statement)) {
            nodesToReturn.push(
                new ExportChainNode({
                    statement,
                    pathToTsFile,
                    exportedName: getNameFromDefaultExportChain(statement),
                    exposedName: "default",
                    namespace: [],
                    shouldDecompose: false,
                    importedName: getNameFromDefaultExportChain(statement),
                })
            );
            // printHelpForCreatedNodes("isDefaultExportChain", nodesToReturn);
            return nodesToReturn;
        }

        if (isNamespaceExport(statement)) {
            const { text } = statement.moduleSpecifier;
            if (isModuleSpecifierOfNodeModule(text)) {
                nodesToReturn.push(
                    new ExportChainLeaf({
                        statement,
                        exposedName: "*" + text,
                        namespace: [getNameFromNamespaceExport(statement)],
                        pathToTsFile,
                        resolutionIndex: 0,
                    })
                );
            } else {
                nodesToReturn.push(
                    new ExportChainNode({
                        statement,
                        pathToTsFile,
                        exportedName: undefined,
                        exposedName: undefined,
                        namespace: [getNameFromNamespaceExport(statement)],
                        shouldDecompose: true,
                        importedName: undefined,
                    })
                );
            }
            // printHelpForCreatedNodes("isNamespaceExport", nodesToReturn);
            return nodesToReturn;
        }

        if (isDelegationExport(statement)) {
            const { text } = statement.moduleSpecifier;
            if (isModuleSpecifierOfNodeModule(text)) {
                nodesToReturn.push(
                    new ExportChainLeaf({
                        statement,
                        pathToTsFile,
                        exposedName: "*" + text,
                        namespace: [],
                        resolutionIndex: 0,
                    })
                );
            } else {
                nodesToReturn.push(
                    new ExportChainNode({
                        statement,
                        pathToTsFile,
                        exposedName: undefined,
                        namespace: [],
                        exportedName: undefined,
                        shouldDecompose: true,
                        importedName: undefined,
                    })
                );
            }
            // printHelpForCreatedNodes("isDelegationExport", nodesToReturn);
            return nodesToReturn;
        }

        if (isNamedExport(statement)) {
            if (isNamedExportPathFull(statement) && isModuleSpecifierOfNodeModule(statement.moduleSpecifier.text)) {
                namedExportNames(statement).forEach(({ name: exposedName }, i) => {
                    //@TODO property name has to be used here
                    nodesToReturn.push(
                        new ExportChainLeaf({
                            statement,
                            pathToTsFile,
                            exposedName,
                            namespace: [],
                            resolutionIndex: i,
                        })
                    );
                });
            } else {
                namedExportNames(statement).forEach(({ name: exposedName, propertyName: importedName }) => {
                    nodesToReturn.push(
                        new ExportChainNode({
                            statement,
                            pathToTsFile,
                            exportedName: exposedName,
                            exposedName,
                            namespace: [],
                            shouldDecompose: false,
                            importedName: importedName ?? exposedName,
                        })
                    );
                });
            }
            return nodesToReturn;
        }

        throw Error(tagUnindent`
            Case not accounted for :

                ${printNodeObject(statement, pathToTsFile)}

            path : ${pathToTsFile}
        `);
    }

    /**
     * @description
     * Converts the next statements that got from `getNextStatements` to export chain nodes or
     * leafs and returns them.
     */
    getNextNodes(): (ExportChainNode | ExportChainLeaf)[] {
        const nodesToReturn: (ExportChainNode | ExportChainLeaf)[] = [];
        const nextStatements = this.getNextStatements();
        // if (printHelpMessages) console.log(printGetNextStatements(nextStatements));
        for (const { newStatement: newS, newPath } of nextStatements) {
            if (isImportStatement(newS)) {
                const { importedName } = this;
                if (importedName === undefined) throw Error(); //@TODO
                const res = getImportStatementOfNameOf(this.pathToTsFile, importedName);
                if (res === undefined) throw Error(); // @TODO
                const { isNamespace, statement, propertyName, name, isDefault, resolutionIndex } = res;

                if (isNamespace) {
                    /**
                     * ```ts
                     * import bar, * as foo from "./somewhere";
                     * export default foo
                     * ```
                     * this "can become" :
                     * ```ts
                     * export bar,* as default from "./somewhere";
                     * ```
                     * and given that it has no exposed name I can understand that it is namespace export
                     */
                    //@TODO maybe make it more higher level
                    /**
                     * @todo
                     * find better name
                     */
                    const temp = (() => {
                        if (isNamedExportPathless(this.statement)) {
                            const { exportedName } = this;
                            if (exportedName === undefined) throw Error(); //@TODO
                            return exportedName;
                        }
                        if (isDefaultExportChain(this.statement)) return "default";
                        throw Error(); // @TODO:
                    })();
                    if (isModuleSpecifierOfNodeModule(statement.moduleSpecifier.text)) {
                        nodesToReturn.push(
                            new ExportChainLeaf({
                                exposedName: null,
                                namespace: [...this.namespace, temp + ".*" + statement.moduleSpecifier.text],
                                pathToTsFile: this.pathToTsFile,
                                resolutionIndex,
                                statement: newS,
                            })
                        );
                    } else {
                        nodesToReturn.push(
                            new ExportChainNode({
                                exportedName: name,
                                exposedName: undefined,
                                importedName: name,
                                namespace: [...this.namespace, temp],
                                pathToTsFile: this.pathToTsFile,
                                shouldDecompose: true,
                                statement: newS,
                            })
                        );
                    }
                }

                if (isDefault) {
                    /**
                     * @todo
                     * I have not taken into account the following case:
                     * ```ts
                     * import foo, * as x from "./somewhere";
                     * export default foo;
                     * ```
                     * this can "become" :
                     * ```ts
                     * export {default} from "./somewhere";
                     * ```
                     */
                    if (isModuleSpecifierOfNodeModule(statement.moduleSpecifier.text)) {
                        nodesToReturn.push(
                            new ExportChainLeaf({
                                exposedName: this.exposedName ?? "default",
                                namespace: this.namespace,
                                pathToTsFile: this.pathToTsFile,
                                statement: newS,
                                resolutionIndex,
                            })
                        );
                    } else {
                        nodesToReturn.push(
                            new ExportChainNode({
                                exportedName: name,
                                importedName: name,
                                exposedName: this.exposedName ?? "default",
                                namespace: this.namespace,
                                pathToTsFile: this.pathToTsFile,
                                shouldDecompose: false,
                                statement: newS,
                            })
                        );
                    }
                }

                if (!isDefault && !isNamespace) {
                    const { exposedName } = this;
                    if (exposedName === undefined) throw Error(); //@TODO
                    /**
                     * ```ts
                     * import bar , {a as A,default as foo,C} from "./some/where";
                     * export default foo;
                     * ```
                     * this "can become" :
                     * ```ts
                     * export {default as default} from "./some/where";
                     * ```
                     */
                    if (isModuleSpecifierOfNodeModule(statement.moduleSpecifier.text)) {
                        nodesToReturn.push(
                            new ExportChainLeaf({
                                exposedName,
                                namespace: [...this.namespace],
                                pathToTsFile: this.pathToTsFile,
                                resolutionIndex,
                                statement: newS,
                            })
                        );
                    } else {
                        nodesToReturn.push(
                            new ExportChainNode({
                                exposedName,
                                namespace: [...this.namespace],
                                pathToTsFile: this.pathToTsFile,
                                statement: newS,
                                exportedName: name,
                                importedName: propertyName,
                                shouldDecompose: false,
                            })
                        );
                    }
                }
                continue;
            }

            if (isExportStatementNonChain(newS)) {
                if (isDefaultExportNonChain(newS)) {
                    throw Error(defaultExportLiteralNotSupported(newS, newPath));
                }
                if (ts.isVariableStatement(newS)) {
                    const names = getNamesFromVariableStatement(newS);
                    if (this.shouldDecompose) {
                        names.forEach((candidateExposedName, i) => {
                            nodesToReturn.push(
                                new ExportChainLeaf({
                                    statement: newS,
                                    pathToTsFile: newPath,
                                    namespace: this.namespace.slice(),
                                    exposedName: this.exposedName ?? candidateExposedName,
                                    resolutionIndex: i,
                                })
                            );
                        });
                    } else {
                        const { importedName, exposedName } = this;
                        //this.exposedName is undefined only for the case of encountering from the start only delegation and namespace exports , bit if that was the case then shouldDecompose would have been tru which for this case is false
                        if (exposedName === undefined) throw Error(); //@TODO
                        if (importedName === undefined) throw Error(); //@TODO
                        nodesToReturn.push(
                            new ExportChainLeaf({
                                statement: newS,
                                pathToTsFile: newPath,
                                namespace: this.namespace.slice(),
                                exposedName,
                                resolutionIndex: getNamesFromNonChainExport(newS).indexOf(importedName),
                            })
                        );
                    }
                    continue;
                }
                nodesToReturn.push(
                    new ExportChainLeaf({
                        statement: newS,
                        exposedName: this.exposedName ?? getNamesFromNonChainExport(newS)[0],
                        namespace: this.namespace.slice(),
                        pathToTsFile: newPath,
                        resolutionIndex: 0,
                    })
                );
                continue;
            }

            if (isDefaultExportChain(newS)) {
                nodesToReturn.push(
                    new ExportChainNode({
                        exportedName: getNameFromDefaultExportChain(newS),
                        exposedName: this.exposedName ?? "default",
                        namespace: this.namespace.slice(),
                        pathToTsFile: newPath,
                        shouldDecompose: false,
                        statement: newS,
                        importedName: getNameFromDefaultExportChain(newS),
                    })
                );
                continue;
            }

            //@TODO add node module case
            if (isNamespaceExport(newS)) {
                // only delegation exports namespace exports have been encountered so far
                const { text } = newS.moduleSpecifier;
                if (this.exposedName === undefined) {
                    if (isModuleSpecifierOfNodeModule(text)) {
                        nodesToReturn.push(
                            new ExportChainLeaf({
                                statement: newS,
                                pathToTsFile: newPath,
                                exposedName: "*" + text,
                                namespace: [...this.namespace, getNameFromNamespaceExport(newS)],
                                resolutionIndex: 0,
                            })
                        );
                    } else {
                        nodesToReturn.push(
                            new ExportChainNode({
                                statement: newS,
                                pathToTsFile: newPath,
                                exportedName: undefined,
                                namespace: [...this.namespace, getNameFromNamespaceExport(newS)],
                                exposedName: undefined,
                                shouldDecompose: true,
                                importedName: undefined,
                            })
                        );
                    }
                } else {
                    //everything has been encountered so far but the last is named export or default export chain
                    if (isModuleSpecifierOfNodeModule(text)) {
                        nodesToReturn.push(
                            new ExportChainLeaf({
                                statement: newS,
                                pathToTsFile: newPath,
                                exposedName: "*" + text,
                                namespace: [...this.namespace, this.exposedName],
                                resolutionIndex: 0,
                            })
                        );
                    } else {
                        nodesToReturn.push(
                            new ExportChainNode({
                                statement: newS,
                                pathToTsFile: newPath,
                                exposedName: undefined,
                                exportedName: undefined,
                                namespace: [...this.namespace, this.exposedName],
                                shouldDecompose: true,
                                importedName: undefined,
                            })
                        );
                    }
                }
                continue;
            }

            //@TODO add node module case
            if (isDelegationExport(newS)) {
                const { text } = newS.moduleSpecifier;
                if (isModuleSpecifierOfNodeModule(text)) {
                    const { exposedName } = this;
                    nodesToReturn.push(
                        new ExportChainLeaf({
                            statement: newS,
                            pathToTsFile: newPath,
                            namespace: this.namespace.slice(),
                            exposedName: exposedName ?? "*" + text,
                            resolutionIndex: 0,
                        })
                    );
                } else {
                    nodesToReturn.push(
                        new ExportChainNode({
                            statement: newS,
                            pathToTsFile: newPath,
                            namespace: this.namespace.slice(),
                            exportedName: this.exportedName,
                            exposedName: this.exposedName,
                            shouldDecompose: this.shouldDecompose,
                            importedName: undefined,
                        })
                    );
                }
                continue;
            }

            //@TODO add node module case
            if (isNamedExport(newS)) {
                if (this.shouldDecompose) {
                    if (isNamedExportPathFull(newS) && isModuleSpecifierOfNodeModule(newS.moduleSpecifier.text)) {
                        nodesToReturn.push(
                            ...namedExportNames(newS).map(
                                ({ name }, i) =>
                                    new ExportChainLeaf({
                                        statement: newS,
                                        exposedName: this.exposedName ?? name,
                                        namespace: this.namespace.slice(),
                                        pathToTsFile: newPath,
                                        resolutionIndex: i,
                                    })
                            )
                        );
                    } else {
                        nodesToReturn.push(
                            ...namedExportNames(newS).map(
                                ({ name, propertyName }) =>
                                    new ExportChainNode({
                                        exportedName: name,
                                        exposedName: this.exposedName ?? name,
                                        namespace: this.namespace.slice(),
                                        pathToTsFile: newPath,
                                        shouldDecompose: false,
                                        statement: newS,
                                        importedName: propertyName ?? name,
                                    })
                            )
                        );
                    }
                } else {
                    const { importedName } = this;
                    if (importedName === undefined) throw Error(); //@TODO
                    if (isNamedExportPathFull(newS) && isModuleSpecifierOfNodeModule(newS.moduleSpecifier.text)) {
                        const { exposedName } = this;
                        if (exposedName === undefined) throw Error(); //@TODO
                        nodesToReturn.push(
                            new ExportChainLeaf({
                                statement: newS,
                                exposedName,
                                namespace: this.namespace.slice(),
                                pathToTsFile: newPath,
                                resolutionIndex: getNamesFromNamedExportStatement(newS).indexOf(importedName),
                            })
                        );
                    } else {
                        nodesToReturn.push(
                            new ExportChainNode({
                                exportedName: this.importedName,
                                exposedName: this.exposedName,
                                namespace: this.namespace.slice(),
                                pathToTsFile: newPath,
                                shouldDecompose: false,
                                statement: newS,
                                importedName: getImportedNameFromExportedName(newS, importedName),
                            })
                        );
                    }
                }
                continue;
            }
        }
        // printHelpForCreatedNodes("nothing", nodesToReturn, false);
        return nodesToReturn;
    }

    /**
     * @description
     * It is not the responsibility of this function to give a resolution index or decompose
     * @todo
     * I have to take into consideration the case of import statement having type
     */
    getNextStatements(): getNextStatementsReturnTypeElement[] {
        const { statement } = this;
        if (isImportStatement(statement) && !this.shouldDecompose) {
            // next statement being import statement comes only from default export
            const newPath = absolutePathFromImportExportPathFull(this.pathToTsFile, statement);
            //I do not understand what is the first clause in this if
            if (statement.importClause.name?.text === this.importedName) {
                return getExportStatementsOfNameOf(newPath, "default").map(({ exportStatement }) => ({
                    newPath,
                    newStatement: exportStatement,
                }));
            } else {
                const { importedName } = this;
                if (importedName === undefined) throw Error(); //@TODO
                return resolveNamedExportPathfullToNonDelegationExport(
                    statement,
                    this.pathToTsFile,
                    this.resolutionIndex
                ).map(({ absolutePathToTsFile, statement }) => ({
                    newPath: absolutePathToTsFile,
                    newStatement: statement,
                }));
            }
        }
        if (isDefaultExportChain(this.statement) || isNamedExportPathless(this.statement)) {
            const nameToSearchFor = (() => {
                const { importedName } = this;
                if (importedName === undefined) {
                    throw Error(tagUnindent`
                        Tried to get the importedName of an export chain node
                        that corresponds to a named export path less and got 
                        undefined as a result, when I should have taken a 
                        string.
                    `);
                }
                return importedName;
            })();
            /**
             * @description
             * The reason for returning an array is because the `nameToSearchFor`
             * can correspond to both a concretion and a type.
             */
            const toReturn: getNextStatementsReturnTypeElement[] = [];

            {
                const res = getExportStatementsNonChainOfNameOf(this.pathToTsFile, nameToSearchFor);
                // this.importedName = nameToSearchFor; // @TODO I think this line does not matter
                if (res.length !== 0) {
                    toReturn.push(
                        ...res.map((s) => ({
                            newPath: this.pathToTsFile,
                            newStatement: s,
                        }))
                    );
                }
            }

            {
                const s = getImportStatementOfNameOf(this.pathToTsFile, nameToSearchFor)?.statement;
                if (s !== undefined)
                    toReturn.push({
                        newPath: this.pathToTsFile,
                        newStatement: s,
                    });
            }

            // console.log(printNodeObject(toReturn[0].newStatement,toReturn[0].newPath));
            // printHelpForGetNextStatements("isDefaultExportChain", toReturn);
            /**
             * The reason that I return here and not in each of the two previous blocks, is because
             * a concretion/type can be resolved from one block and a type.concretion can be resolved
             * from the other block
             */
            return toReturn;
        }
        if (isNamedExportPathFull(this.statement)) {
            const toReturn = resolveNamedExportPathfullToNonDelegationExport(
                this.statement,
                this.pathToTsFile,
                this.resolutionIndex
            ).map(({ absolutePathToTsFile, statement }) => ({
                newPath: absolutePathToTsFile,
                newStatement: statement,
            }));

            // printHelpForGetNextStatements("isNamedExport", toReturn);
            return toReturn;
        }
        const newPath = absolutePathFromImportExportPathFull(this.pathToTsFile, this.statement);
        if (isDelegationExport(this.statement)) {
            if (this.shouldDecompose) {
                const toReturn = getExportStatementsOf(newPath)
                    .filter((s) => (isExportStatementNonChain(s) && hasExportModifier(s)) || isExportStatementChain(s))
                    .map((s) => ({
                        newPath,
                        newStatement: s,
                    }));
                // printHelpForGetNextStatements("isDelegationExport", toReturn);
                return toReturn;
            } else {
                //delegation export with `shouldDecompose` being `false` has to never happen because of `shallow resolve named export`
                throw Error(); //@TODO
            }
        }
        if (isNamespaceExport(this.statement) || (isImportStatement(this.statement) && this.shouldDecompose)) {
            const toReturn = getExportStatementsOf(newPath)
                .filter((s) => (isExportStatementNonChain(s) && hasExportModifier(s)) || isExportStatementChain(s))
                .map((s) => ({
                    newPath,
                    newStatement: s,
                }));
            return toReturn;
        }
        throw Error(); //@TODO
    }

    /**
     * @description
     * That is for the case the context export statement is of multiple exports like this :
     * ```ts
     * export {A,b as B,default as C,default} from "./some/where";// ["A","B","C","default"] -> [0,1,2,3]
     * export const a : number = 45, b : string = "32";// ["a","b"] -> [1,2]
     * ```
     * The resolution index defines which one it corresponds to.
     * It throws for the case the context statement is not named export or variable statement.
     */
    get resolutionIndex(): number {
        const { statement, exportedName } = this;
        if (exportedName === undefined) throw Error(); //@TODO
        let names: string[];

        if (ts.isVariableStatement(statement)) names = getNamesFromVariableStatement(statement);
        else if (isNamedExportPathFull(statement)) names = getNamesFromNamedExportStatement(statement);
        else if (isImportStatement(statement)) names = getNamesFromImportStatement(statement).map(({ name }) => name);
        else throw Error(); //@TODO
        const resolutionIndex = names.indexOf(exportedName);
        if (resolutionIndex === -1) throw Error(); //@TODO
        return resolutionIndex;
    }

    resolve(): ExportChainLeaf[] {
        const toReturn: ExportChainLeaf[] = [];
        // if (printHelpMessages) console.log(printArrayOfExportNode([this]));
        let leftToResolve = this.getNextNodes();
        // if (printHelpMessages) console.log(printArrayOfExportNode(leftToResolve));
        while (leftToResolve.length > 0) {
            const temp: (ExportChainNode | ExportChainLeaf)[] = [];
            leftToResolve.forEach((n) => {
                if (n instanceof ExportChainLeaf) toReturn.push(n);
                else temp.push(...n.getNextNodes());
            });
            leftToResolve = temp;
            // if (printHelpMessages) console.log(printArrayOfExportNode(leftToResolve));
        }
        return toReturn;
    }
}

export type getNextStatementsReturnTypeElement = {
    /**
     * @description
     * Are import statements only due to export pathless and default export chains?
     */
    newStatement: exportChainLeafStatement;
    /**
     * @description
     * This is for the case of a named export exporting something from a chain of delegation exports.
     */
    newPath: string;
};
