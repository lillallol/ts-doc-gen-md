import { format } from "./format";

it("todo", () => {
    //     const res = format(`
    //     /**
    //      * Some description
    //      * @template T some description about the type parameter
    //      * @param {y} some description about parameter y
    //      * @returns some more description
    //      */
    //     export function  foo<T extends {[x : string] : number}>(
    //         y :  Y ,
    //         z : { [ x in  "a" |  "b" |  "c" ]? :  Z }= {} ,
    //         { a = "1", b } : {
    //             /**
    //              * Some jsdoc
    //             */
    //             a? : string,
    //             b? : number}= {} ,
    //         A : boolean ,
    //         x? :  T , ...xx : unknown[]) : A is  true {
    // //some code
    // }

    // //     `)
    const res = format(`

    /**/export/**/ /**/declare/**/ /**/type/**/ /**/test/**/ /**/=/**/ 
    /**/number/**//**/;/**/
    
`);
    console.log(res);
});
