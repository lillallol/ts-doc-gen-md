import { exportChainLeafStatement } from "../../ts-ast-resolve/index";
import { referencedTypes } from "../types";
import { DocumentationReferenceNode } from "./DocumentationReferenceNode";

export class DocumentationNode extends DocumentationReferenceNode {
    exposedName: string|null;
    namespace: string[];

    constructor(_: {
        exposedName: string|null;
        namespace: string[];
        statement: exportChainLeafStatement;
        resolutionIndex: number;
        pathToTsFile: string;
        referencedTypes: referencedTypes;
    }) {
        const {
            exposedName,
            namespace,
            statement,
            resolutionIndex,
            referencedTypes,
            pathToTsFile
        } = _;
        super({
            pathToTsFile: pathToTsFile,
            referencedTypes,
            resolutionIndex,
            statement,
        });
        this.exposedName = exposedName;
        this.namespace = namespace;
    }

    get totalExposedName() : string {
        const {namespace,exposedName} = this;
        return [...namespace,exposedName].join(".");
    }
}