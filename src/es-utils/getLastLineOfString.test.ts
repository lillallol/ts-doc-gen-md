import { getLastLineOfString } from "./getLastLineOfString";

describe(getLastLineOfString.name,() => {
    it.each<[{string : string, result : string}]>([
        [{
            string : "hello",
            result : "hello"
        }],
        [{
            string : "hello\nworld",
            result : "world"
        }],
        [{
            string : "hello\nworld\n!",
            result : "!"
        }],
    ])("returns the last line of the string",({result,string}) => {
        expect(getLastLineOfString(string)).toBe(result);
    })
});