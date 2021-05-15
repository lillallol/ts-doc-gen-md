import { exportStatementChain, exportStatementNonChain, importStatement } from "../ts-ast-utils/index";

export type exportChainLeafStatement = exportStatementNonChain | importStatement | exportStatementChain;