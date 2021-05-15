export function firstLinesFactory(numberOfLines: number) {
    return function firstLines(string: string): string {
        return (
            string
                .split("\n")
                .slice(0, numberOfLines)
                .join("\n") + (string.split("\n").length > numberOfLines ? "\n..." : "")
        );
    };
}
