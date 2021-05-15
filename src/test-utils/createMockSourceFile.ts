import {ts} from "../ts-ast-utils/index";

/**
 * @description
 * 
*/
export function createMockSourceFile(code: string): ts.SourceFile {
    return ts.createSourceFile("mock.ts", code, ts.ScriptTarget.Latest);
}
