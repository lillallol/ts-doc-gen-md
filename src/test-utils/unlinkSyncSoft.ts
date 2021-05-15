import * as fs from "fs";

export function unlinkSyncSoft(path: string): void {
    try {
        fs.unlinkSync(path);
    } catch {
        //
    }
}
