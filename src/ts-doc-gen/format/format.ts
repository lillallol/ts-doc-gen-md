import * as prettier from "prettier";

export function format(s: string): string {
    return prettier
        .format(s, {
            parser: "typescript",
            printWidth: 140,
            tabWidth: 4,
        })
        .trim();
}
