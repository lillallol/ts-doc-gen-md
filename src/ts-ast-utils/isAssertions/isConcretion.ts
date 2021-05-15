import * as ts from "../adapters/typescript";
import { isAbstraction } from "./isAbstraction";

export function isConcretion(statement: ts.Statement): statement is ts.FunctionDeclaration | ts.VariableStatement | ts.ClassDeclaration {
    return !isAbstraction(statement);
}