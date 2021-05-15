export function isModuleSpecifierOfNodeModule(_: string): boolean {
    return !_.startsWith(".");
}
