import * as path from "path";

import {
    ts,
    printNodeObject,
    getExportStatementsNonChainOfNameOf,
    getImportStatementOfNameOf,
    isImportStatement,
    isExportStatementChain,
    getNamesFromImportStatement,
    namedExportNames,
    isDefaultImport,
    isNameSpaceImport,
    isDefaultNamespaceImport,
    isDefaultNamedImport,
    isNamedImport,
    isDelegationExport,
    isNamespaceExport,
    getJsDocOfAstNode,
    isNamedExportPathFull,
} from "../../ts-ast-utils/index";
import { tagUnindent } from "../../es-utils/index";
import { DocumentationReferenceNode } from "./DocumentationReferenceNode";
import {
    resolveIdentifier,
    resolveConcretionIdentifier,
    ExportChainLeaf,
    exportChainLeafStatement,
} from "../../ts-ast-resolve/index";
import { referencedTypes } from "../types";
import { DocumentationNode } from "./DocumentationNode";
import { format } from "../format/format";
import { ExportChainLeafToNodeDocumentationOrReferenceMap } from "./ExportChainLeafToNodeDocumentationOrReferenceMap";
import { unescapeLeadingUnderscores } from "typescript";
import { internalErrorMessages } from "../../errorMessages";

/**
 * @description
 * After resolve public api has been used to get back an array with non duped
 * export chain leaf nodes, this functions is called with each element of that
 * array.
 * Creates the `DocumentationNode` for the provided export chain leaf.
 * It also creates recursively its related `DocumentationReferenceNode`s.
 * They are all added in the provided maps.
 */
export function documentExportChainLeaf(_: {
    exportChainLeaf: ExportChainLeaf;
    exportChainLeafToDocumentationNodeMap: ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationNode>;
    exportChainLeafToDocumentationReferenceNodeMap: ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationReferenceNode>;
}): void {
    const {
        exportChainLeaf,
        exportChainLeafToDocumentationNodeMap,
        exportChainLeafToDocumentationReferenceNodeMap,
    } = _;
    const referencedTypes: referencedTypes = {};
    const documentationNode = new DocumentationNode({
        ...exportChainLeaf,
        referencedTypes,
    });
    const documentationReferenceNode = exportChainLeafToDocumentationReferenceNodeMap.get(exportChainLeaf);
    if (documentationReferenceNode !== undefined) {
        documentationNode.docText = documentationReferenceNode.docText;
        documentationNode.referencedTypes = documentationReferenceNode.referencedTypes;
        //this is not really needed
        exportChainLeafToDocumentationReferenceNodeMap.delete(exportChainLeaf);
    } else {
        documentationNode.docText = format(
            iterateAst({
                ...exportChainLeaf,
                exportChainLeafToDocumentationNodeMap,
                exportChainLeafToDocumentationReferenceNodeMap,
                referencedTypes,
            }).trim()
        );
    }
    exportChainLeafToDocumentationNodeMap.set(exportChainLeaf, documentationNode);
}

/**
 * @description
 * @todo
 * Add description.
 * @todo
 * Check if all extra error messages are into an array in the tagUnindent.
 * @todo
 * Have to add extra information that inform about that the error ocurred while
 * trying to iterate the ast of statement to create documentation.
 */
function iterateAst(_: {
    statement: exportChainLeafStatement;
    pathToTsFile: string;
    resolutionIndex: number;
    referencedTypes: referencedTypes;
    exportChainLeafToDocumentationNodeMap: ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationNode>;
    exportChainLeafToDocumentationReferenceNodeMap: ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationReferenceNode>;
}): string {
    //#region utils
    const {
        pathToTsFile,
        resolutionIndex,
        statement,
        exportChainLeafToDocumentationNodeMap,
        exportChainLeafToDocumentationReferenceNodeMap,
        referencedTypes,
    } = _;
    /**
     * @description
     * This is needed for spotting type alias or interface declarations statements
     * that circularly reference themselves so that when documenting them, infinite
     * loops will not be created by type substitution.
     * It is the statement for which the documentation is created.
     * It is not necessarily the root statement.
     */
    const initialStatement = statement;

    /**
     * @description
     * A singleton that maps identifier names to :
     * - `undefined` or `0` if they are not type parameters
     * - non zero if they are type parameters
     */
    const isTypeParameter: isTypeParameter = {};
    const _printAstNode = (u: ts.astNode) => printNodeObject(u, pathToTsFile);

    /**
     * @description
     * It return an empty string for `undefined` input.
     * It returns something like this :
     * ```
     * <T extends B,F>
     * ```
     * It adds properly the type parameters in the `isTypeParameter` singleton.
     */
    const _printTypeParameters = (typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined) =>
        toDocTextTypeParameters(typeParameters);

    /**
     * @description
     * It adds also an extra space in the end of the printed modifiers string.
     */
    const _printModifiers = (modifiers: ts.ModifiersArray | undefined) =>
        modifiers !== undefined ? modifiers.map((m) => _toDocText(m)).join(" ") + " " : "";

    /**
     * @description
     * Returns :
     * ```text
     * <T1,T2>
     * ```
     * or an empty string for `undefined`.
     */
    function _printTypeArguments(typeArguments: ts.NodeArray<ts.TypeNode> | undefined): string {
        // prettier-ignore
        return (
                typeArguments !== undefined ? "<" + typeArguments.map((_) => _toDocText(_)).join(",") + ">" : ""
            )
    }

    /**
     * @description
     * Prints the last JSDoc element of the provided jsDoc array.
     * Returns an empty string then there is no JSDoc comment.
     */
    const _printJsDoc = (astNode: ts.astNode) => {
        const jsDoc: ts.JSDoc[] | undefined = getJsDocOfAstNode(astNode);
        if (jsDoc === undefined) return "";
        return _printAstNode(jsDoc[jsDoc.length - 1]) + "\n";
    };

    const hasPrivateOrProtectedModifier = (astNode: ts.astNode): boolean => {
        const { modifiers } = astNode;
        if (modifiers === undefined) return false;
        return Array.from(modifiers).some(
            (modifier) =>
                modifier.kind === ts.SyntaxKind.PrivateKeyword || modifier.kind === ts.SyntaxKind.ProtectedKeyword
        );
    };
    /**
     * @description
     * It does not add parentheses. You have to add them manually,
     * It returns results like this :
     * ```
     * a : string,b : number
     * ```
     */
    const _printParameters = (u: ts.NodeArray<ts.ParameterDeclaration>) =>
        Array.from(u)
            .map((p) => _toDocText(p))
            .join(",");

    /**
     * @todo
     * I think this should be moved to the adapter
     * and make variables statements have an extra property that give let var const
     */
    const _variableStatementToConstLetVar = (astNode: ts.VariableStatement): string => {
        const res = _printAstNode(astNode.declarationList).trim()[0];
        if (res === "c") return "const";
        if (res === "l") return "let";
        if (res === "v") return "var";

        throw Error(
            internalErrorMessages.internalLibraryErrorForToDocText({
                astNodes: [astNode],
                initialStatement,
                pathToTsFile,
                specificErrorMessage: tagUnindent`
                    Tried to get const, let or var from a variable declaration and failed.
                `,
            })
        );
    };

    function _registerThemAsTypeParameters(
        registry: isTypeParameter,
        typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>
    ) {
        if (typeParameters !== undefined) {
            Array.from(typeParameters).forEach((typeParameter) => {
                const { name } = typeParameter;
                const key = ts.unescapeLeadingUnderscores(name.escapedText);
                makeItZeroIfUndefined(registry, key);
                const v = registry[key];
                if (v === undefined) {
                    throw Error(
                        internalErrorMessages.internalLibraryErrorForToDocText({
                            astNodes: [typeParameter],
                            initialStatement,
                            pathToTsFile,
                            specificErrorMessage: tagUnindent`
                                The number of occurrences of a registered type parameter can not
                                be undefined.
                            `,
                        })
                    );
                }
                registry[key] = v + 1;
            });
        }
    }

    function _unregisterThemAsTypeParameters(
        registry: isTypeParameter,
        typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>
    ) {
        if (typeParameters !== undefined) {
            Array.from(typeParameters).forEach((typeParameter) => {
                const { name } = typeParameter;
                const key = ts.unescapeLeadingUnderscores(name.escapedText);
                const v = registry[key];
                if (v === undefined) {
                    throw Error(
                        internalErrorMessages.internalLibraryErrorForToDocText({
                            astNodes: [typeParameter],
                            initialStatement,
                            pathToTsFile,
                            specificErrorMessage: tagUnindent`
                            The number of occurrences of a registered type parameter can not
                            be undefined.
                        `,
                        })
                    );
                }
                registry[key] = v - 1;
            });
        }
    }

    function toDocTextTypeParameters(typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined): string {
        _registerThemAsTypeParameters(isTypeParameter, typeParameters);
        const toReturn =
            typeParameters !== undefined
                ? `<${typeParameters.map((typeParameter) => _toDocText(typeParameter)).join(" , ")}>`
                : "";
        _unregisterThemAsTypeParameters(isTypeParameter, typeParameters);
        return toReturn;
    }

    /**
     * ```ts
     * class A       extends  ts.B.C   implements fs.F.D , ds.C.G {
     * //            heritage clause   ------heritage clause-----
     * // returns : "extends  ts.B.C   implements fs.F.D , ds.C.G"
     *  constructor() {}
     * }
     * ```
     * ```ts
     * interface foo extends fs.F.D , ds.C.G {
     * //            ----heritage clause----
     * // returns   "extends fs.F.D , ds.C.G"
     *  prop : string
     * }
     * ```
     */
    function _printHeritageClauses(_: {
        heritageClauses: ts.NodeArray<ts.HeritageClause> | undefined;
        isInterface: boolean;
    }): string {
        const { isInterface, heritageClauses } = _;

        if (heritageClauses === undefined) return "";
        if (heritageClauses.length === 2) {
            return (
                "extends " +
                _printHeritageClauseTypes({
                    expressionWithTypeArgumentsNodeArray: heritageClauses[0].types,
                    hyperLinkedIdentifierIs: 2,
                }) +
                " implements " +
                _printHeritageClauseTypes({
                    expressionWithTypeArgumentsNodeArray: heritageClauses[1].types,
                    hyperLinkedIdentifierIs: 3,
                })
            );
        }
        if (heritageClauses.length === 1) {
            const heritageClause = heritageClauses[0];
            const printedHeritageClause = _printAstNode(heritageClause).trim();
            const pattern = /^(extends)|(implements)/;
            if (!pattern.test(printedHeritageClause)) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        astNodes: [heritageClause],
                        initialStatement,
                        pathToTsFile,
                        specificErrorMessage: tagUnindent`
                            ast node does not match the pattern:
                        
                                ${pattern.source}

                        `,
                    })
                );
            }
            const extendsImplements = printedHeritageClause.startsWith("extends") ? "extends" : "implements";
            const hyperLinkedIdentifierIs: 3 | 2 = (() => {
                if (isInterface) return 3;
                if (!isInterface && extendsImplements === "extends") return 2;
                if (!isInterface && extendsImplements === "implements") return 3;
                //@TODO add extra information
                //@TODO make the error message more thorough
                throw Error();
            })();
            return (
                extendsImplements +
                " " +
                _printHeritageClauseTypes({
                    expressionWithTypeArgumentsNodeArray: heritageClause.types,
                    hyperLinkedIdentifierIs,
                })
            );
        }
        throw Error(
            internalErrorMessages.internalLibraryErrorForToDocText({
                astNodes: Array.from(heritageClauses),
                initialStatement,
                pathToTsFile,
                specificErrorMessage: tagUnindent`
                    Encountered a case in which a heritage clause is not undefined and not of
                    length 1 or 2.
                `,
            })
        );
    }

    /**
     * @todo
     * find what is wrong with the types so that I do no need to use as assertions
     * @description
     * ```ts
     * class A extends B.C.D implements F.G.H , H.J.K {
     * //              -----            -------------
     * // returns :   "B.C.D"          "F.G.H , H.J.K"
     *  constructor() {}
     * }
     * ```
     * ```ts
     * interface foo extends F.G.H , H.J.K {
     * //                    -------------
     * // returns :         "F.G.H , H.J.K"
     * }
     * ```
     */
    function _printHeritageClauseTypes(_: {
        expressionWithTypeArgumentsNodeArray: ts.NodeArray<ts.ExpressionWithTypeArguments>;
        /**
         * @description
         * The same parameter as the one in the documentHyperLinkedIdentifier
         * - `2` for `extends` of class
         * - `3` for `extends` of interface or `implements` of class
         */
        hyperLinkedIdentifierIs: 2 | 3;
    }): string {
        const { expressionWithTypeArgumentsNodeArray, hyperLinkedIdentifierIs } = _;
        return Array.from(expressionWithTypeArgumentsNodeArray)
            .map((expressionWithTypeArguments) => {
                const { typeArguments } = expressionWithTypeArguments;
                //@TODO as
                let currentExpression = expressionWithTypeArguments.expression as
                    | ts.PropertyAccessExpression
                    | ts.Identifier;
                const names: string[] = [];
                while (!ts.isIdentifier(currentExpression)) {
                    names.push(ts.unescapeLeadingUnderscores(currentExpression.name.escapedText));
                    currentExpression = currentExpression.expression as ts.PropertyAccessExpression | ts.Identifier;
                }
                names.push(ts.unescapeLeadingUnderscores(currentExpression.escapedText));
                names.reverse();

                documentHyperLinkedIdentifier({
                    hyperLinkedIdentifierIs,
                    nameToSearchFor: names[0],
                    part: names.slice(1),
                });

                return names.join(".") + _printTypeArguments(typeArguments);
            })
            .join(" , ");
    }

    function typeQueryUtil(
        exprName: ts.EntityName
    ): {
        name: string;
        stringToReturn: string;
        part: string[];
    } {
        /**
         * ```ts
         * export declare type A = typeof foo;
         * ```
         */
        if (ts.isIdentifier(exprName)) {
            const name: string = unescapeLeadingUnderscores(exprName.escapedText);
            return {
                name,
                part: [],
                stringToReturn: "typeof " + name,
            };
        }
        /**
         * ```ts
         * export declare type A = typeof foo.A.B;
         * ```
         */
        if (ts.isQualifiedName(exprName)) {
            const { qualifiers, name } = ((): { qualifiers: string[]; name: string } => {
                let { left: currentLeft } = exprName;
                const { right } = exprName;
                const names = [right.text];
                while (ts.isQualifiedName(currentLeft)) {
                    const { left, right } = currentLeft;
                    names.push(right.text);
                    currentLeft = left;
                }
                names.push(currentLeft.text);
                names.reverse();
                return {
                    qualifiers: names.slice(1),
                    name: names[0],
                };
            })();
            return {
                name,
                part: qualifiers,
                stringToReturn: "typeof " + [name, ...qualifiers].join("."),
            };
        }
        throw Error(); //@TODO
    }

    function indexAccessTypeUtil(
        indexAccessNode: ts.IndexedAccessTypeNode
    ): {
        indexes: string[];
        leftOverNode: ts.TypeReferenceNode | ts.TypeQueryNode;
    } {
        const { indexType } = indexAccessNode;
        const indexes: string[] = [_toDocText(indexType)];

        let { objectType: currentNode } = indexAccessNode;
        while (ts.isIndexedAccessTypeNode(currentNode)) {
            const { indexType, objectType } = currentNode;
            indexes.unshift(_toDocText(indexType));
            currentNode = objectType;
        }

        if (!ts.isTypeReferenceNode(currentNode) && !ts.isTypeQueryNode(currentNode)) throw Error(); //@TODO

        return {
            indexes,
            leftOverNode: currentNode,
        };
    }

    function typeReferenceUtil(typeReferenceNode: ts.TypeReferenceNode): { qualifiers: string[]; name: string } {
        const { typeName } = typeReferenceNode;
        if (ts.isQualifiedName(typeName)) {
            /**
             * @todo
             * ```ts
             * type A = ts.A.B
             * ```
             */
            let { left: currentLeft } = typeName;
            const { right } = typeName;
            const names = [right.text];
            while (ts.isQualifiedName(currentLeft)) {
                const { left, right } = currentLeft;
                names.push(right.text);
                currentLeft = left;
            }
            names.push(currentLeft.text);
            names.reverse();
            return {
                qualifiers: names.slice(1),
                name: names[0],
            };
        }
        if (ts.isIdentifier(typeName)) {
            /**
             * ```ts
             * type A = ts;
             * ```
             */
            return {
                qualifiers: [],
                name: ts.unescapeLeadingUnderscores(typeName.escapedText),
            };
        }
        throw Error(); //@TODO
    }

    /**
     * @description
     * While iterating the ast of a statement to be documented and a non generic type reference
     * is encountered, it has to be also documented.
     *
     * The responsibility of this function is to find the statements that define the type
     * reference and document them respecting part.
     */
    function documentHyperLinkedIdentifier(_: {
        /**
         * @description
         * Name of the identifier of the type reference as it is encountered when documenting
         * the statement that contains it.
         * @example
         * class A extends B { constructor() {} }; // B
         */
        nameToSearchFor: string;
        /**
         * @description
         * - 1st case
         *  - concretion
         *  - import from node module
         *  - export statement chain from node module
         *  ```ts
         *  export declare let A: typeof A;
         *  ```
         *
         * - 2nd case
         *  - class declaration
         *  - import from node module
         *  - export statement chain from node module
         *  ```ts
         *  class A extends B { constructor() {} };
         *  ```
         *
         * - 3rd case
         *  - class declaration
         *  - type alias declaration
         *  - interface declaration
         *  - import from node module
         *  - export statement chain from node module
         *  ```ts
         *  export declare let A: A;
         *  ```
         */
        hyperLinkedIdentifierIs: 1 | 2 | 3;
        /**
         * @description
         * This is only needed when documenting hyperlinked identifiers from import expressions like this :
         * ```ts
         * export declare type myType = import("./somewhere").aType;
         * ```
         */
        newAbsolutePathToFileOfNode?: string;
        part?: string[];
    }): void {
        const { nameToSearchFor, hyperLinkedIdentifierIs, part } = _;

        let { newAbsolutePathToFileOfNode } = _;
        if (newAbsolutePathToFileOfNode === undefined) newAbsolutePathToFileOfNode = pathToTsFile;

        /**
         * @description
         * These are the resolved statements from the `nameToSearchFor`.
         * It can be a mix of namespaced and non namespaced statements
         * due to 3 of `hyperLinkedIdentifierIs`.
         */
        const resolvedStatements = (() => {
            if (hyperLinkedIdentifierIs === 1 || hyperLinkedIdentifierIs === 2) {
                return [resolveConcretionIdentifier(newAbsolutePathToFileOfNode, nameToSearchFor)];
            }
            if (hyperLinkedIdentifierIs === 3) {
                return resolveIdentifier(newAbsolutePathToFileOfNode, nameToSearchFor).filter(
                    ({ statement: s }) =>
                        ts.isClassDeclaration(s) ||
                        ts.isTypeAliasDeclaration(s) ||
                        ts.isInterfaceDeclaration(s) ||
                        isImportStatement(s) || // only node module
                        isExportStatementChain(s) // only node module
                );
            }
            throw Error(
                internalErrorMessages.internalLibraryErrorForToDocText({
                    astNodes: [],
                    initialStatement,
                    pathToTsFile,
                    specificErrorMessage: tagUnindent`
                        hyperLinkedIdentifierIs can get number values : 

                            1 , 2 , 3

                        but got : 

                            ${[hyperLinkedIdentifierIs]}

                        name to search for :

                            ${nameToSearchFor}

                    `,
                })
            );
        })();

        // console.log(tagUnindent`
        //     nameToSearchFor :

        //         ${nameToSearchFor}

        //     initialStatement :

        //         ${[_printNodeObject(initialStatement)]}

        //     initialPart :

        //         ${[initialPart !== undefined ? JSON.stringify(initialPart, undefined, "    ") : "undefined"]}

        //     resolvedStatements :

        //         ${[
        //             resolvedStatements
        //                 .map(({ statement: s, pathToTsFile }) => printNodeObject(s, pathToTsFile))
        //                 .join("\n\n"),
        //         ]}

        // `);

        // namespace :

        // ${[JSON.stringify(namespace,undefined,"    ")]}

        // const referencedTypes = getReferencedTypes();

        //@TODO I have not thought thoroughly about edge cases here
        const toDocument: ExportChainLeaf[] = (() => {
            if (part === undefined) return resolvedStatements;
            let toReturn: ExportChainLeaf[] = [];
            let currentMaximumLength = 0;
            resolvedStatements.forEach((exportChainLeaf) => {
                const { namespace, exposedName } = exportChainLeaf;
                const totalName = [...namespace.slice(1), exposedName];
                let count = 0;
                for (let i = 0; i < part.length; i++) {
                    if (part[i] === totalName[i]) {
                        count++;
                        continue;
                    }
                    break;
                }
                if (count > currentMaximumLength) {
                    currentMaximumLength = count;
                    toReturn = [exportChainLeaf];
                    return;
                }
                if (count === currentMaximumLength) {
                    toReturn.push(exportChainLeaf);
                    return;
                }
                if (count < currentMaximumLength) {
                    return;
                }
                throw Error(); //@TODO
            });
            return toReturn;
        })();

        toDocument.forEach((exportChainLeaf): void => {
            const { statement: s, pathToTsFile, namespace, exposedName, resolutionIndex } = exportChainLeaf;

            const name = (() => {
                if (namespace.length > 0) return [nameToSearchFor, ...namespace.slice(1), exposedName].join(".");
                else return nameToSearchFor;
            })();

            referencedTypes[name] = exportChainLeaf;

            const documentationNode = exportChainLeafToDocumentationNodeMap.get(exportChainLeaf);
            if (documentationNode !== undefined) return;
            const documentationReferenceNode = exportChainLeafToDocumentationReferenceNodeMap.get(exportChainLeaf);
            if (documentationReferenceNode !== undefined) return;

            //the rest of the code is executed only for the case the export
            //chain leaf that is hyperlinked does not have a doc node
            {
                const referencedTypes: referencedTypes = {};
                const documentationReferenceNode = new DocumentationReferenceNode({
                    pathToTsFile,
                    referencedTypes,
                    statement: s,
                    resolutionIndex,
                });
                exportChainLeafToDocumentationReferenceNodeMap.set(exportChainLeaf, documentationReferenceNode);
                documentationReferenceNode.docText = format(
                    iterateAst({
                        statement: s,
                        pathToTsFile: pathToTsFile,
                        resolutionIndex,
                        referencedTypes,
                        exportChainLeafToDocumentationNodeMap,
                        exportChainLeafToDocumentationReferenceNodeMap,
                    })
                ).trim();
            }
        });
    }

    /**
     * @description
     * It prints the object literal `{ }` part of :
     *
     * - type nodes
     * - interface declarations
     * - type alias declarations
     *
     * respecting part.
     */
    function _printTypeOfObject(members: ts.TypeElement[]) {
        // prettier-ignore
        return (
                "{\n" +
                members
                    .filter((member) => !hasPrivateOrProtectedModifier(member))
                    .map((member) => _toDocText(member).trim())
                    .join("\n") +
                "}"
            );
    }

    /**
     * @description
     * This functions prints the `{ }` part of a class respecting part.
     */
    function _printClassElements(classElements: ts.ClassElement[]): string {
        //@TODO think about making the placeholder simpler
        return tagUnindent`
                {
                    ${classElements
                        .filter((m) => {
                            const { name } = m;
                            if (ts.isConstructorDeclaration(m)) return !hasPrivateOrProtectedModifier(m);
                            if (name === undefined) {
                                //@TODO replace it with extra error
                                throw Error(
                                    internalErrorMessages.internalLibraryErrorForToDocText({
                                        astNodes: [m],
                                        pathToTsFile,
                                        initialStatement,
                                        specificErrorMessage: tagUnindent`
                                            While iterating the elements of a class, an element was encountered
                                            that had undefined name. I have not taken into consideration such a 
                                            case.
                                        `,
                                    })
                                );
                            }
                            return !ts.isPrivateIdentifier(name) && !hasPrivateOrProtectedModifier(m);
                        })
                        .map((m) => _toDocText(m))
                        .join("\n")}
                }
            `;
    }

    //#endregion

    /**
     * @description
     * Iterates the ast of the provided statement and returns its type signature as string.
     *
     * Switch clause will not work properly in toDocText since it does not provide intellisense
     * the same is valid for for checking the kind
     * @todo
     * I have to add a comment for each if clause explaining the reason behind its existence
     * @todo
     * consider the possibility of call stack exceeded
     * @todo
     * have to take into account also the -? and ? and infer keyword public
     * @todo
     * make it possible to run a user provided callback on each returned ast node string
     */
    function _toDocText(astNode: ts.astNode): string {
        //#region statements
        if (ts.isVariableStatement(astNode)) {
            const { modifiers } = astNode;
            if (resolutionIndex === undefined) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile: pathToTsFile,
                        astNodes: [astNode],
                        initialStatement,
                        specificErrorMessage: tagUnindent`
                            Tried to iterate a variable statement but the resolution index is undefined.
                        `,
                    })
                );
            }
            const letVarConst = _variableStatementToConstLetVar(astNode);
            // prettier-ignore
            return (
                (resolutionIndex === 0 ?  _printJsDoc(astNode)  : "") +
                _printModifiers(modifiers) +
                letVarConst + " " +
                _toDocText(astNode.declarationList.declarations[resolutionIndex])
            );
        }

        /**
         * ```ts
         * class A extends B.D.F implements C.D.F , G.H.J {
         *  constructor<T>() {}
         * }
         * ```
         */
        if (ts.isClassDeclaration(astNode)) {
            const { heritageClauses, modifiers, name, typeParameters, members } = astNode;
            if (Array.from(members).some((member) => !ts.isClassElement(member))) throw Error(); //@TODO
            const classElements = Array.from(members).filter(ts.isClassElement);
            //prettier-ignore
            return (
                _printJsDoc(astNode) +
                _printModifiers(modifiers) + 
                " class " + 
                (name !== undefined ? _toDocText(name) + _printTypeParameters(typeParameters) : "") + " " + 
                _printHeritageClauses({ heritageClauses , isInterface : false}) +
                _printClassElements(classElements)
            );
        }

        if (ts.isFunctionDeclaration(astNode)) {
            const { parameters, type, typeParameters, modifiers, name } = astNode;
            if (type === undefined) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile,
                        astNodes: [astNode],
                        initialStatement,
                        specificErrorMessage: tagUnindent`
                            Function declaration does not have type. Is the path really pointing to a d.ts file?
                        `,
                    })
                );
            }
            //prettier-ignore
            return (
                _printJsDoc(astNode) +
                _printModifiers(modifiers) +
                "function " +
                (name !== undefined ? _printAstNode(name) : "") + 
                _printTypeParameters(typeParameters) + 
                `(${parameters.map((parameter) => _toDocText(parameter)).join(" , ")})` + 
                " : " + 
                _toDocText(type)
            );
        }

        /**
         * ```ts
         * export declare type myType = number;
         * ```
         */
        if (ts.isTypeAliasDeclaration(astNode)) {
            const { name, type, typeParameters, modifiers } = astNode;
            // if (ts.isTypeLiteralNode(type)) console.warn(_printNodeObject(type));
            //prettier-ignore
            return (
                _printJsDoc(astNode) +
                _printModifiers(modifiers) +
                "type " +
                _printAstNode(name) +
                _printTypeParameters(typeParameters) +
                " = "+
                _toDocText(type)
            )
        }

        /**
         * ```ts
         * export interface A extends B {
         *  a : number
         * }
         * ```
         */
        if (ts.isInterfaceDeclaration(astNode)) {
            const { modifiers, name, members, typeParameters, heritageClauses } = astNode;
            const _members = Array.from(members).filter(ts.isTypeElement);
            if (members.length !== _members.length) throw Error(); //@TODO
            // prettier-ignore
            return (
                _printJsDoc(astNode) +
                _printModifiers(modifiers) +
                "interface " + 
                _toDocText(name) +
                _printTypeParameters(typeParameters) + " " +
                _printHeritageClauses({heritageClauses,isInterface : true}) +
                _printTypeOfObject(_members)
            );
        }

        //#endregion
        //#region ast node
        if (ts.isEnumDeclaration(astNode)) {
            const { members, modifiers, name } = astNode;
            return (
                _printModifiers(modifiers) +
                " enum " +
                _toDocText(name) +
                " " +
                "{" +
                Array.from(members)
                    .map(({ name, initializer }) => {
                        if (initializer === undefined) throw Error(); //@TODO
                        return _toDocText(name) + " = " + _toDocText(initializer);
                    })
                    .join(",\n") +
                "}"
            );
        }
        /**
         * ```ts
         * export declare const a : number , n = 1;
         * ```
         */
        if (ts.isVariableDeclaration(astNode)) {
            const { type, name, initializer } = astNode;
            // prettier-ignore
            return (
                _toDocText(name) + 
                (type !== undefined ? " : " + _toDocText(type) : "") +
                (initializer !== undefined ? " = " + _toDocText(initializer) : "")
            );
        }

        if (ts.isIdentifier(astNode)) {
            const toReturn = ts.unescapeLeadingUnderscores(astNode.escapedText);
            return toReturn;
        }

        if (ts.isAsExpression(astNode)) {
            throw Error(
                internalErrorMessages.internalLibraryErrorForToDocText({
                    pathToTsFile,
                    astNodes: [astNode],
                    initialStatement,
                    specificErrorMessage: tagUnindent`
                        Encountered as assertion expression. This is not yet supported.
                        Are as assertion expressions supposed to exist in d.ts files?
                        Does the absolute path really point to a d.ts file?
                    `,
                })
            );
        }

        /**
         * ```ts
         * export declare const myValue: {a :string, b: number};
         * ```
         */
        if (ts.isTypeLiteralNode(astNode)) {
            const { members } = astNode;
            const _members = Array.from(members).filter(ts.isTypeElement);
            if (members.length !== _members.length) throw Error(); //@TODO
            return _printTypeOfObject(_members);
        }

        /**
         * ```ts
         * export declare class A {
         *  constructor()
         *  set a() : string
         * }
         * ```
         */
        if (ts.isSetAccessor(astNode)) {
            const { name, type, parameters, typeParameters, modifiers } = astNode;
            if (typeParameters !== undefined) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile: pathToTsFile,
                        initialStatement,
                        astNodes: [astNode],
                        specificErrorMessage: tagUnindent`
                            Are setters supposed to have type parameters? If yes, I have not taken into
                            account such a case.
                        `,
                    })
                );
            }
            // prettier-ignore
            return (
                _printJsDoc(astNode) +
                _printModifiers(modifiers) + 
                "set " + 
                _toDocText(name) + 
                "(" + _printParameters(parameters) + ")" +
                (type !== undefined ? " : " + _toDocText(type) : "")
            );
        }

        /**
         * ```ts
         * export declare class A {
         *  constructor()
         *  get a() : string
         * }
         * ```
         */
        if (ts.isGetAccessor(astNode)) {
            const { name, type, parameters, typeParameters, modifiers } = astNode;
            if (typeParameters !== undefined) {
                //@TODO replace it with extra error
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile,
                        initialStatement,
                        astNodes: [astNode],
                        specificErrorMessage: tagUnindent`
                            Are getters supposed to have type parameters? If yes, I have not taken into
                            account such a case.
                        `,
                    })
                );
            }
            // prettier-ignore
            return (
                _printJsDoc(astNode) +
                _printModifiers(modifiers) +
                "get " + 
                _toDocText(name) + "()" +
                _printParameters(parameters) + 
                (type !== undefined ? " : " + _toDocText(type) : "")
            );
        }

        /**
         * ```ts
         * declare class A {
         *  constructor():void
         * }
         * ```
         */
        if (ts.isConstructorDeclaration(astNode)) {
            const { type, parameters } = astNode;
            return `constructor(${_printParameters(parameters)})${type !== undefined ? ":" + _toDocText(type) : ""}`;
        }

        /**
         * ```ts
         * declare class A {
         *  p : number;
         *  c = 3
         *  constructor():void
         * }
         * ```
         * //@TODO test this following case and search puppeteer word in this file to compare
         * ```ts
         * declare class A {
         *  private myProp;
         * }
         * ```
         */
        if (ts.isPropertyDeclaration(astNode)) {
            const { name, type, initializer, modifiers } = astNode;
            return (
                _printModifiers(modifiers) +
                _printJsDoc(astNode) +
                _toDocText(name) +
                (type !== undefined ? ` : ${_toDocText(type)}` : "") +
                (initializer !== undefined ? ` = ${_toDocText(initializer)}` : "") +
                ";"
            );
        }

        /**
         * ```ts
         * export declare const a: 1;
         * ```
         */
        if (ts.isNumericLiteral(astNode)) {
            return astNode.text;
        }

        /**
         * ```ts
         * export declare const a: "a string";
         * ```
         */
        if (ts.isStringLiteral(astNode)) {
            return `"${astNode.text}"`;
        }

        /**
         * ```ts
         * export declare const DIC: import("./somewhere").IDic;
         * ```
         */
        if (ts.isImportTypeNode(astNode)) {
            const { argument, qualifier, typeArguments } = astNode;
            if (qualifier === undefined) throw Error();
            if (ts.isQualifiedName(astNode)) throw Error();
            const _path = _toDocText(argument).trim();
            const nameToSearchFor = _toDocText(qualifier).trim();

            documentHyperLinkedIdentifier({
                newAbsolutePathToFileOfNode: path.resolve(pathToTsFile, "../", _path.slice(1, -1) + ".d.ts"),
                nameToSearchFor,
                hyperLinkedIdentifierIs: 3,
            });

            return nameToSearchFor + _printTypeArguments(typeArguments);
        }

        /**
         * ```ts
         * export declare const DIC: new () => { a : number };
         * ```
         */
        if (ts.isConstructorTypeNode(astNode)) {
            const { typeParameters, parameters, type } = astNode;
            //prettier-ignore
            return (
                "new " +
                _printTypeParameters(typeParameters) +
               "(" +  _printParameters(parameters) + ")" +
                " => " +
                _toDocText(type)
            );
        }

        /**
         * @todo
         * add example
         */
        if (ts.isFunctionTypeNode(astNode)) {
            const { name, typeParameters, parameters, type } = astNode;
            // prettier-ignore
            const res =  (
                (name !== undefined ? _toDocText(name) : "") +
                _printTypeParameters(typeParameters) + " " +
                "(" + _printParameters(parameters) + ")" +
                " => " +
                _toDocText(type)
            );
            return res;
        }

        /**
         * ```ts
         * declare type myType<A> = A extends B ? C : D;
         * ```
         */
        if (ts.isConditionalTypeNode(astNode)) {
            return `${_toDocText(astNode.checkType)} extends ${_toDocText(astNode.extendsType)} ? ${_toDocText(
                astNode.trueType
            )} : ${_toDocText(astNode.falseType)}`;
        }

        /**
         * ```ts
         * export declare type A = typeof foo;
         * ```
         */
        /**
         * ```ts
         * export declare type A = typeof foo.A.B;
         * ```
         */
        /**
         * This is an index access type and not a type query node.
         * ```ts
         * export declare type A = typeof obj.A.B[C]["D"];
         * ```
         */
        if (ts.isTypeQueryNode(astNode)) {
            const { exprName } = astNode;
            const { name, stringToReturn, part } = typeQueryUtil(exprName);
            documentHyperLinkedIdentifier({ nameToSearchFor: name, hyperLinkedIdentifierIs: 1, part });
            return stringToReturn;
        }

        /**
         * * type reference:
         *
         *   ```ts
         *   export declare type A = ts;
         *   //typeReferenceNode:    --
         *   ```
         *   ```ts
         *   export declare type A = ts.A.B;
         *   //typeReferenceNode:    ------
         *   ```
         *
         * * index access type:
         *
         *   ```ts
         *   export declare type A = ns1.ns2.ns3["A"]["B"]["C"];
         *   //indexAccessTypeNode:  --------------------------
         *   //typeReference:        -----------
         *   ```
         *   ```ts
         *   export declare type A = ns1.ns2.f<Page["goto"]>[1]["A"|"B"][T];
         *   //indexAccessTypeNode:  --------------------------------------
         *   //typeReference:        -----------------------
         *   ```
         *   ```ts
         *   export declare type A = typeof obj.A.B[C]["D"];
         *   //indexAccessTypeNode:                --------
         *   //typeQuery:            --------------
         *   ```
         */
        if (ts.isTypeReferenceNode(astNode) || ts.isIndexedAccessTypeNode(astNode)) {
            //#region
            const { name, stringToReturn, part, isTypeQuery } = ((): {
                name: string;
                stringToReturn: string;
                part: string[];
                isTypeQuery: boolean;
            } => {
                if (ts.isIndexedAccessTypeNode(astNode)) {
                    const { leftOverNode, indexes } = indexAccessTypeUtil(astNode);
                    if (ts.isTypeQueryNode(leftOverNode)) {
                        const { part, stringToReturn, name } = typeQueryUtil(leftOverNode.exprName);
                        return {
                            isTypeQuery: true,
                            name,
                            part: [...part, ...indexes],
                            stringToReturn: stringToReturn + "[" + indexes.join("][") + "]",
                        };
                    }
                    if (ts.isTypeReferenceNode(leftOverNode)) {
                        const { name, qualifiers } = typeReferenceUtil(leftOverNode);
                        const { typeArguments } = leftOverNode;
                        return {
                            isTypeQuery: false,
                            name,
                            part: [...qualifiers, ...indexes],
                            stringToReturn:
                                [name, ...qualifiers].join(".") +
                                _printTypeArguments(typeArguments) +
                                (indexes.length === 0 ? "" : "[" + indexes.join("][") + "]"),
                        };
                    }
                }
                if (ts.isTypeReferenceNode(astNode)) {
                    const { name, qualifiers } = typeReferenceUtil(astNode);
                    const { typeArguments } = astNode;
                    return {
                        isTypeQuery: false,
                        name,
                        part: qualifiers,
                        stringToReturn: [name, ...qualifiers].join(".") + _printTypeArguments(typeArguments),
                    };
                }
                throw Error(); //@TODO
            })();

            if (isTypeQuery) {
                documentHyperLinkedIdentifier({
                    nameToSearchFor: name,
                    hyperLinkedIdentifierIs: 1,
                    part,
                });
                return stringToReturn;
            }

            const isNotGeneric = isTypeParameter[name] === 0 || isTypeParameter[name] === undefined;
            const isGeneric = !isNotGeneric;
            const typeOrInterfaceOrClassStatementOfNameThatExistsInSameFile = (() => {
                const res = getExportStatementsNonChainOfNameOf(pathToTsFile, name).filter(
                    (s) => ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s) || ts.isClassDeclaration(s)
                );
                if (res.length > 1) throw Error();
                return res[0];
            })();
            const typeOrInterfaceOrClassStatementOfNameExistsInSameFile = !!typeOrInterfaceOrClassStatementOfNameThatExistsInSameFile;
            const importStatementOfNameExists =
                !typeOrInterfaceOrClassStatementOfNameExistsInSameFile &&
                !!getImportStatementOfNameOf(pathToTsFile, name);
            //#endregion

            if (isGeneric) {
                // console.log("reference is generic");
                return stringToReturn;
            }

            if (
                isNotGeneric &&
                typeOrInterfaceOrClassStatementOfNameExistsInSameFile &&
                typeOrInterfaceOrClassStatementOfNameThatExistsInSameFile !== initialStatement
            ) {
                documentHyperLinkedIdentifier({
                    nameToSearchFor: name,
                    hyperLinkedIdentifierIs: 3,
                    part,
                });
                return stringToReturn;
            }

            if (
                isNotGeneric &&
                typeOrInterfaceOrClassStatementOfNameExistsInSameFile &&
                typeOrInterfaceOrClassStatementOfNameThatExistsInSameFile === initialStatement
            ) {
                // console.log("self references its self");
                return stringToReturn;
            }

            if (isNotGeneric && importStatementOfNameExists) {
                documentHyperLinkedIdentifier({
                    nameToSearchFor: name,
                    hyperLinkedIdentifierIs: 3,
                    part,
                });
                return stringToReturn;
            }

            // Map,WeakMap,Record such stuff as type references
            if (
                isNotGeneric &&
                !importStatementOfNameExists &&
                !typeOrInterfaceOrClassStatementOfNameExistsInSameFile
            ) {
                // console.log("is built in type reference");
                // const { typeName, typeArguments } = typeReferenceNode;
                return stringToReturn;
                // return (
                //     _toDocText(typeName) + _printTypeArguments(typeArguments)
                //     //@TODO I think I should throw when typeArguments are undefined
                //     // (typeArguments !== undefined ? "<" + typeArguments.map((_) => _toDocText(_)).join(",") + ">" : "")
                // );
            }
            throw Error(); //@TODO
        }

        if (astNode.kind === ts.SyntaxKind.FalseKeyword) return "false";
        if (astNode.kind === ts.SyntaxKind.TrueKeyword) return "true";
        if (astNode.kind === ts.SyntaxKind.AnyKeyword) return "any";
        if (astNode.kind === ts.SyntaxKind.DeclareKeyword) return "declare";
        if (astNode.kind === ts.SyntaxKind.DefaultKeyword) return "default";
        if (astNode.kind === ts.SyntaxKind.ExportKeyword) return "export";
        if (astNode.kind === ts.SyntaxKind.NeverKeyword) return "never";
        if (astNode.kind === ts.SyntaxKind.VoidKeyword) return "void";
        if (astNode.kind === ts.SyntaxKind.StringKeyword) return "string";
        if (astNode.kind === ts.SyntaxKind.NumberKeyword) return "number";
        if (astNode.kind === ts.SyntaxKind.BooleanKeyword) return "boolean";
        if (astNode.kind === ts.SyntaxKind.NullKeyword) return "null";
        if (astNode.kind === ts.SyntaxKind.UndefinedKeyword) return "undefined";
        if (astNode.kind === ts.SyntaxKind.SymbolKeyword) return "symbol";
        if (astNode.kind === ts.SyntaxKind.ReadonlyKeyword) return "readonly";
        if (astNode.kind === ts.SyntaxKind.UnknownKeyword) return "unknown";
        if (astNode.kind === ts.SyntaxKind.InferKeyword) return "infer";
        if (astNode.kind === ts.SyntaxKind.StaticKeyword) return "static";
        if (astNode.kind === ts.SyntaxKind.ObjectKeyword) return "object";
        if (astNode.kind === ts.SyntaxKind.BigIntKeyword) return "bigint";
        if (astNode.kind === ts.SyntaxKind.QuestionToken) return "?";
        if (astNode.kind === ts.SyntaxKind.MinusToken) return "-?";
        /**
         * @TODO
         * Encountered such a thing in puppeteer.
         * I have no clue why it has no type.
         * ```ts
         * export declare class myClass {
         *     private _myProp;
         * }
         * ```
         */
        if (astNode.kind === ts.SyntaxKind.PrivateKeyword) return "private";

        if (ts.isParenthesizedTypeNode(astNode)) {
            const { type } = astNode;
            return "(" + _toDocText(type) + ")";
        }

        if (ts.isParameter(astNode)) {
            const { name, questionToken, type, dotDotDotToken, initializer } = astNode;
            if (type === undefined) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile,
                        astNodes: [astNode],
                        initialStatement,
                        specificErrorMessage: tagUnindent`
                            Encountered a parameter without type. Have not taken into account such a case.
                            Is this a valid case? Does the path point to a d.ts file?
                        `,
                    })
                );
            }
            return (
                (dotDotDotToken !== undefined ? "..." : "") +
                _printAstNode(name) +
                (questionToken ? _toDocText(questionToken) : "") +
                " : " +
                _toDocText(type) +
                (initializer !== undefined ? "=" + _printAstNode(initializer) : "")
            );
        }

        /**
         * ```ts
         * export declare type A = string[]
         * ```
         */
        if (ts.isArrayTypeNode(astNode)) {
            return _toDocText(astNode.elementType) + "[]";
        }

        /**
         * ```ts
         * export declare type A = [string,number];
         * ```
         */
        if (ts.isTupleTypeNode(astNode)) {
            const { elements } = astNode;
            return "[" + elements.map((e) => _toDocText(e)).join(",") + "]";
        }

        /**
         * ```ts
         * export declare type A = [string,...number[]];
         * ```
         */
        if (ts.isRestTypeNode(astNode)) {
            const { type } = astNode;
            return "..." + _toDocText(type);
        }

        /**
         * ```ts
         * export declare type A = string|number;
         * ```
         */
        if (ts.isUnionTypeNode(astNode)) {
            return astNode.types.map((type) => _toDocText(type)).join(" | ");
        }

        /**
         * ```ts
         * export declare type A = string;
         * ```
         */
        if (ts.isLiteralTypeNode(astNode)) {
            const { literal } = astNode;
            return _printAstNode(literal);
        }

        /**
         * ```ts
         * export declare type myType = {
         *  [x : string]: symbol;
         * };
         * ```
         * take a look also in `isMappedTypeNode` clause
         */
        if (ts.isIndexSignatureDeclaration(astNode)) {
            const { parameters, type } = astNode;
            const parameter = parameters[0];
            const { type: _type } = parameter;
            if (_type === undefined) throw Error();
            return `[${_toDocText(parameter.name)} : ${_toDocText(_type)}] : ${_toDocText(type)}`;
        }

        /**
         * ```ts
         * export declare type myType = {
         *  [x in "a"|"b"]: symbol;
         * };
         * ```
         */
        if (ts.isMappedTypeNode(astNode)) {
            const { typeParameter, type, questionToken } = astNode;
            if (type === undefined)
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile,
                        initialStatement,
                        astNodes: [astNode],
                        specificErrorMessage: tagUnindent`
                            Type of mapped type node is undefined while it is not expected to be.
                        `,
                    })
                );
            const { constraint } = typeParameter;
            if (constraint === undefined) throw Error();
            return `{ [ ${_printAstNode(typeParameter.name)} in ${_toDocText(constraint)} ]${
                questionToken !== undefined ? _toDocText(questionToken) : ""
            } : ${_toDocText(type)} }`;
        }

        /**
         * ```ts
         * export declare type myType = {
         *  [x in keyof A]: symbol;
         * };
         * ```
         */
        if (ts.isTypeOperatorNode(astNode)) {
            const printedNode = _printAstNode(astNode).trim();
            const regex = /^((keyof)|(unique)) /;
            const match = printedNode.match(regex);
            if (match === null) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile,
                        astNodes: [astNode],
                        initialStatement,
                        specificErrorMessage: tagUnindent`
                            Encountered ast node which is expected to be of the following pattern:

                                ${regex.source}

                            but is not.
                        `,
                    })
                );
            }
            const operator = match[0];
            const { type } = astNode;
            return operator + " " + _toDocText(type);
        }

        /**
         * ```ts
         * export declare type myType<A extends B> = A;
         * ```
         */
        if (ts.isTypeParameterDeclaration(astNode)) {
            const { name, constraint } = astNode;

            return _printAstNode(name) + (constraint !== undefined ? ` extends ${_toDocText(constraint)}` : "");
        }

        /**
         * ```ts
         * export declare type myType = string & number;
         * ```
         */
        if (ts.isIntersectionTypeNode(astNode)) {
            return astNode.types.map((type) => _toDocText(type)).join(" & ");
        }

        /**
         * ```ts
         * export declare type myType = {
         *  readonly x : number
         * };
         * ```
         */
        if (ts.isPropertySignature(astNode)) {
            const { name, type, questionToken, modifiers } = astNode;
            if (type === undefined) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile,
                        astNodes: [astNode],
                        initialStatement,
                        specificErrorMessage: tagUnindent`
                            Encountered a property signature without type. Have not taken into account such a case.
                            Is this a valid case? Does the path point to a d.ts file?
                        `,
                    })
                );
            }
            // prettier-ignore
            return (
                _printJsDoc(astNode) +
                _printModifiers(modifiers) +
                _toDocText(name) +
                (questionToken !== undefined ? _toDocText(questionToken) : "") +
                " : " +
                _toDocText(type)
            );
        }

        /**
         * ```ts
         * export declare type myType = {
         *  x?<T>(a : string): T;
         * };
         * ```
         */
        if (ts.isMethodSignature(astNode)) {
            const { name, type, questionToken, typeParameters, parameters, modifiers } = astNode;
            if (type === undefined) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile,
                        astNodes: [astNode],
                        initialStatement,
                        specificErrorMessage: tagUnindent`
                            Encountered a method signature without type. Have not taken into account such a case.
                            Is this a valid case? Does the path point to a d.ts file?
                        `,
                    })
                );
            }
            // prettier-ignore
            return (
                _printJsDoc(astNode) + 
                _printModifiers(modifiers) +
                _toDocText(name) +
                (questionToken !== undefined ? _toDocText(questionToken) : "") +
                _printTypeParameters(typeParameters) +
                "(" + _printParameters(parameters) + ")" +
                " : " +
                _toDocText(type)
            );
        }

        if (ts.isMethodDeclaration(astNode)) {
            const { modifiers, name, parameters, typeParameters, type } = astNode;
            // prettier-ignore
            return (
                _printJsDoc(astNode) + 
                _printModifiers(modifiers) +
                _toDocText(name) +
                _printTypeParameters(typeParameters) +
                "(" + _printParameters(parameters) + ")" +
                (type !== undefined ? ":" + _toDocText(type) : "")
            );
        }

        /**
         * ```ts
         * export declare type IDic = new () => { x : number };
         * ```
         * @todo test for type parameters
         */
        if (ts.isConstructSignatureDeclaration(astNode)) {
            const { parameters, type, typeParameters } = astNode;
            if (type === undefined) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile,
                        astNodes: [astNode],
                        initialStatement,
                        specificErrorMessage: tagUnindent`
                            Encountered a constructor signature declaration without type.
                            Have not taken into account such a case. Is this a valid case?
                            Does the path point to a d.ts file?
                        `,
                    })
                );
            }
            // prettier-ignore
            return (
                `new ${_printTypeParameters(typeParameters)}` +
                "(" +
                    parameters
                    .map((parameter) => _toDocText(parameter))
                    .join(" , ") + 
                ")" + 
                `: ${_toDocText(type)}`
            )
        }

        /**
         * ```ts
         * declare function foo(a: unknown): a is number;
         * ```
         */
        if (ts.isTypePredicateNode(astNode)) {
            const { parameterName, type } = astNode;
            if (type === undefined) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile: pathToTsFile,
                        astNodes: [astNode],
                        initialStatement,
                        specificErrorMessage: tagUnindent`
                            Encountered a type predicate node without type. Have not taken into account such a case.
                            Is this a valid case? Does the path point to a d.ts file?
                        `,
                    })
                );
            }
            if (!ts.isIdentifier(parameterName)) {
                throw Error(
                    internalErrorMessages.internalLibraryErrorForToDocText({
                        pathToTsFile,
                        astNodes: [astNode],
                        initialStatement,
                        specificErrorMessage: tagUnindent`
                            Encountered an is assertion with left identifier being non identifier.
                            Have not taken into account such a case. Is this a this keyword?
                            Is this a valid case? Does the path point to a d.ts file?
                        `,
                    })
                );
            }
            return `${_toDocText(parameterName)} is ${_toDocText(type)}`;
        }

        /**
         * ```ts
         * export declare type $Call<Fn extends (...args: any[]) => any> =
         * Fn extends (arg: any) => infer RT ? RT : never;
         * ```
         */
        if (ts.isInferTypeNode(astNode)) {
            const { typeParameter } = astNode;
            return "infer " + ts.unescapeLeadingUnderscores(typeParameter.name.escapedText);
        }

        /**
         * @todo
         * I have not tested that
         */
        // default import all cases
        // prettier-ignore
        if (
            ts.isImportDeclaration(astNode) && 
            (
                isDefaultImport(astNode) || 
                (isDefaultNamespaceImport(astNode) && resolutionIndex === 0) ||
                (isDefaultNamedImport(astNode) && resolutionIndex === 0)
            )
        ) { 
            const {importClause : {name,isTypeOnly},moduleSpecifier } = astNode;
            return `import ${isTypeOnly ? "type" : ""} ${ts.unescapeLeadingUnderscores(name.escapedText)} from "${moduleSpecifier.text}"`;
        }

        // namespace import all cases
        // prettier-ignore
        if (
            ts.isImportDeclaration(astNode) && (
                isNameSpaceImport(astNode) || 
                (isDefaultNamespaceImport(astNode) && resolutionIndex === 1)
            )
        ) { 
            const {importClause : {namedBindings : {name},isTypeOnly},moduleSpecifier } = astNode;
            return `import ${isTypeOnly ? "type" : ""} * as ${ts.unescapeLeadingUnderscores(name.escapedText)} from "${moduleSpecifier.text}"`;
        }

        // named import all cases
        // prettier-ignore
        if (
            ts.isImportDeclaration(astNode) && (
                isNamedImport(astNode) ||
                (isDefaultNamedImport(astNode) && resolutionIndex > 0)
            )
        ) { 
            const { moduleSpecifier ,importClause : {isTypeOnly}} = astNode;
            const {name,propertyName} = getNamesFromImportStatement(astNode)[resolutionIndex];
            const type = isTypeOnly ? "type" : "";
            const clause = propertyName === undefined || propertyName === name ? name : propertyName + " as " + name;
            const path = moduleSpecifier.text;
            return `import ${type} {${clause}} from "${path}";`;
        }

        if (ts.isExportDeclaration(astNode) && isNamedExportPathFull(astNode)) {
            const { moduleSpecifier, isTypeOnly } = astNode;
            const { name, propertyName } = namedExportNames(astNode)[resolutionIndex];
            const type = isTypeOnly ? "type" : "";
            const clause = propertyName === undefined || propertyName === name ? name : propertyName + " as " + name;
            const path = moduleSpecifier.text;

            return `export ${type} {${clause}} from "${path}";`;
        }

        if (ts.isExportDeclaration(astNode) && isNamespaceExport(astNode)) {
            const {
                moduleSpecifier,
                exportClause: { name },
            } = astNode;
            return `export * as ${ts.unescapeLeadingUnderscores(name.escapedText)} from "${moduleSpecifier.text}"`;
        }

        if (ts.isExportDeclaration(astNode) && isDelegationExport(astNode)) {
            const { moduleSpecifier } = astNode;
            return `export * from "${moduleSpecifier.text}"`;
        }
        //#endregion

        throw Error(
            internalErrorMessages.internalLibraryErrorForToDocText({
                pathToTsFile,
                astNodes: [astNode],
                initialStatement,
                specificErrorMessage: tagUnindent`
                        While iterating the ast of initial statement, a case of ast node 
                        was encountered that has not been taken into consideration:
                `,
            })
        );
    }
    const res = _toDocText(initialStatement);
    // console.log(Object.keys(getReferencedTypes(initialStatement)),printNodeObject(initialStatement,absolutePathToFileOfExportChainLeafStatementToBeDocumented));
    // console.log(res);
    return res;
}

//#region utils

function makeItZeroIfUndefined(dictionary: isTypeParameter, key: string): void {
    if (dictionary[key] === undefined) dictionary[key] = 0;
}
//#endregion

type isTypeParameter = {
    [x: string]: number | undefined;
};
