import { exportStatementChain, exportStatementNonChain, importStatement } from "../../ts-ast-utils";

export class ExportChainLeaf {
    /**
     * @description
     * `importStatement` and `exportStatementChain` is for node modules
     */
    statement: exportStatementNonChain | importStatement | exportStatementChain;
    pathToTsFile: string;
    /**
     * @description
     * `null` is only for the case of delegation export from node module
    */
    exposedName: string | null;
    namespace: string[];
    resolutionIndex: number;

    constructor(_: {
        statement: exportStatementNonChain | importStatement | exportStatementChain;
        pathToTsFile: string;
        exposedName: string | null;
        namespace: string[];
        resolutionIndex: number;
    }) {
        const { exposedName, namespace, pathToTsFile, statement, resolutionIndex } = _;
        this.statement = statement;
        this.pathToTsFile = pathToTsFile;
        this.exposedName = exposedName;
        this.namespace = namespace;
        this.resolutionIndex = resolutionIndex;
    }
}
