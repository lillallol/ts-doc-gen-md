# ts-doc-gen-md

## Table of contents

<!--#region toc-->

- [Table of contents](#table-of-contents)
- [Installation](#installation)
- [Description](#description)
- [Coverage](#coverage)
- [Best practices](#best-practices)
- [Non covered cases](#non-covered-cases)
- [Documentation](#documentation)
- [Motivation](#motivation)
- [Acknowledgements](#acknowledgements)
- [You might find interesting](#you-might-find-interesting)
- [FAQs](#faqs)
- [Contributing](#contributing)
    - [Terminology](#terminology)
        - [chain export statement](#chain-export-statement)
        - [delegation export statement](#delegation-export-statement)
        - [namespace export statement](#namespace-export-statement)
        - [named export path full](#named-export-path-full)
        - [named export path less](#named-export-path-less)
        - [default export chain](#default-export-chain)
        - [export statement non chain](#export-statement-non-chain)
        - [export chain leaf statement](#export-chain-leaf-statement)
        - [export statement](#export-statement)
        - [resolution index](#resolution-index)
        - [statement index](#statement-index)
        - [entry point file](#entry-point-file)
        - [resolve export statement](#resolve-export-statement)
        - [documentation node](#documentation-node)
        - [documentation reference node](#documentation-reference-node)
    - [How it works](#how-it-works)
    - [Help needed](#help-needed)
- [Changelog](#changelog)
    - [0.0.0](#000)
- [License](#license)

<!--#endregion toc-->

## Installation

```bash
npm install --save-dev ts-doc-gen-md
```

## Description

<!--@TODO add examples of documentations here  -->

Library that generates documentation in markdown for TypeScript projects. The created documentation is just the type signatures together with their respective raw JSDoc comments. For the documentation to be generated you have to provide the typings entry point of your project. Every type that is exported from there, together with the types it references, is resolved and documented. Imports and exports from node modules are documented as import and export statements, without further deeper resolution into the node module itself.

You can inject the markdown in the `README.md` file (take a look at [md-in-place](https://www.npmjs.com/package/md-in-place) for that purpose) or create a separate markdown file. The markdown is made in such a way so that it is displayed properly on github. For the best results follow the [best practices](#Best-practices). The library will not work for the [non covered cases](#Non-covered-cases).

## Coverage

Code coverage is around 90%.

## Best practices

0.  The internal API should depend on the public API, not the other way around.
    <details>
    <summary>examples</summary>

    The following code snippet is an example of a typings entry point file that has its public API depend on the private API:

    ```ts
    export declare type iAmPublic = {
        prop1: boolean;
        prop2: Omit<iAmBad, "a">;
    };
    declare type iAmBad = {
        a: "a";
        b: "b";
    };
    ```

    The type `iAmBad` gets fully documented (both of its properties `a` and `b` are documented), while only the property `b` is needed for the public API. That is neither a fault or a lack of features by the documentation generation library. The public api being dependent on the private api, is to be blamed here. Here is how to inverse the dependency:

    ```ts
    export declare type iAmPublic = {
        prop1: boolean;
        prop2: iAmPublicAndNotPrivateDependent;
    };
    declare type iAmPublicAndNotPrivateDependent = { b: "b" };
    declare type iAmPrivateAndPublicDependent = {
        a: string;
    } & iAmPublicAndNotPrivateDependent;
    ```

    Now the generated documentation will not document property `a`.

    Similarly we can apply the same idea for other built in type functions (like : <code>Pick</code>, <code>Parameters</code> and <code>ReturnType</code>) that are usually used in way that makes the public API depend on the private API.

    Another similar example:

    ```ts
    export declare type iAmPublic = iAmBad["b"];
    declare type iAmBad = {
        a: "a";
        b: "b";
    };
    ```

    and here is how to achieve dependency inversion:

    ```ts
    export type iAmPublic = iAmPublicAndNotPrivateDependent;
    declare type iAmPublicAndNotPrivateDependent = "b";
    declare type iAmPrivateAndPublicDependent = {
        a: "a";
        b: iAmPublicAndNotPrivateDependent;
    };
    ```

    </details>

1.  For projects that do not export many values from their entry point, it is advised to create a file called `publicApi.ts`, that will contain all the public api types. This file should be placed in the root of your source folder so that it is easily accessible.
2.  Keep the JSDoc comments concise.
3.  A part of the documentation has to be written in the README file and the JSDoc comments of your source code should have it as a context.
4.  Add a ruler in your code editor at a fixed column for all typescript files. This will aid you in creating JSDoc comments that do not overflow beyond that column.
5.  Functions with parameters that have initial values, do not get their initial values documented. Consider gathering all the parameters in an object and then using JSDoc comments with `@default` JSDoc tag to defined the initial value.
    <details>
    <summary>example</summary>

    -   bad:
        ```ts
        export function foo(a: number = 1) {
            //some code
        }
        ```
    -   good:
        ```ts
        export function foo(parameters: {
            /**
             * @default 1
             */
            a: number;
        }) {
            //initialize parameter `a` here
            //some code
        }
        ```

    </details>

6.  It would be a good idea to avoid using classes, if possible. The sole reason is that the JSDoc comments of the implemented interfaces do not appear in the IDE intellisense. This forces you to write the JSDoc comments in the class, which makes your public API documentation be scattered throughout your project.
7.  If your public api exposes regular expressions values, they will appear as type `RegExp` in the generated documentation. For that reason make sure that you write descriptive enough JSDoc comments that will appear in the documentation and explain what the regular expression does.

## Non covered cases

0.  Function overloading
1.  TypeScript namespaces
2.  TypeScript decorators
3.  TypeScript triple slash directives
4.  CommonJS import/exports
5.  imports and exports from node modules are documented as import and export statements, without further deeper resolution into the node module itself
6.  chain export statements or type references that need to be resolved for documentation and on resolution stumble upon delegation export statements from node modules
    <details>
    <summary>Example</summary>

    In the current example since the library does not get into node modules when resolving exports, it is not possible to know whether there is an exported type from `node-module` with identifier `A`.

    ```ts
    // index.ts
    export { A } from "aFile.ts";

    // aFile.ts
    export * from "node-module";

    export declare const A = 1;
    ```

    </details>

## Documentation

The function that generates documentation has been converted to CLI using [fn-to-cli](https://github.com/lillallol/fn-to-cli). That means that you can generate documentation using the CLI or by importing the function from the entry point of this node module.

Use in terminal the following command:

```bash
npx ts-doc-gen-md --help
```

to get the CLI documentation:

<!--#region documentation !./documentation.txt-->

```txt
CLI syntax:

  ts-doc-gen-md tsDocGenMd? [[--<option> | -<flag>] <value>]#

Description:

  Generates documentation in markdown, given the typings entry point file of a
  typescript project.

Non required options:

  -i --input                 : string                  = "./dist/index.d.ts"  Path to the typings entry point file.
  -o --output                : string                  = undefined            Path to save the generated documentation. If no path is provided then no output file is created.
     --sort                  : boolean                 = false                Display in alphabetic order the documentation.
     --prefixHref            : string                  = ""                   Prefix for all the hyperlinks of the generated documentation.
     --headingStartingNumber : 2 | 3 | 4 | 5 | 6       = 3                    Number that specifies the starting heading number of the generated documentation.
     --format                : (src: string) => string = (src) => src         Used to format the code.

```

<!--#endregion documentation-->

## Motivation

I was looking to automate the documentation generation process for my TypeScript projects, and I realized that I had to create my own documentation generation library. I made that decision after I checked the available choices: [typedoc](http://typedoc.org/), [api-extractor](https://api-extractor.com/), which back then (December of 2020), I found:

1. difficult to be used
2. opinionated
3. slow at adopting features
4. missing basic features
5. producing documentation that is unfamiliar looking to the developer

## Acknowledgements

-   [astexplorer.net](https://astexplorer.net/) was of tremendous help for this project because it made exploration of the ast easy
-   [ts-ast-viewer](https://ts-ast-viewer.com/) was sometimes used for getting a second opinion on the values of the ast
-   from this [link](https://convincedcoder.com/2019/01/19/Processing-TypeScript-using-TypeScript/#sourcefiles-and-the-abstract-syntax-tree-ast) I learned how to parse TypeScript code to ast
-   I used the ast parser and a lot of other utility functions from [TypeScript node module](https://www.npmjs.com/package/TypeScript)
-   [ts to d.ts playground](https://www.TypeScriptlang.org/play?target=1#code/Q)

## You might find interesting

-   [typedoc](http://typedoc.org/), documentation generation library for TypeScript projects
-   [api-extractor](https://api-extractor.com/), documentation generation library for TypeScript projects

## FAQs

<details>
<summary>Why there is no option for generating documentation that has by default collapsed the details tags?</summary>

That is because, it will not make it possible to properly hyperlink to type references, since they will point to a collapsed details tag.

</details>

<details>
<summary>Will there ever be an option to generate documentation in html?</summary>

No. I consider that over-engineering. Markdown is enough for generating documentation even for complex libraries.

</details>

<details>
<summary>Why do I have to provide the typings entry point file instead of the entry point of my typescript project?</summary>

That is likely because I am not experienced enough with the typescript node module abstract syntax tree parser.

The `d.ts` files simplify complicated cases that appear in the `.ts` files. For example there is no need for me to do type inference and resolve destructured exports.

<!--
-   Destructured exports.

    ```ts
    //bad
    const obj = {
        fn1() {
            //
        },
        fn2() {
            //
        }
    }
    export const {fn1,fn2} = obj;
    ```

-   Named exports that are not explicitly typed.

    ```ts
    // bad
    export function foo(x, y) {
        return x + y;
    }
    ```

    ```ts
    // good
    export function foo(x: number, y: number): number {
        return x + y;
    }
    ```

-   Default exports that require type inference.

    ```ts
    // bad
    default export { a : 1 , b : 2};
    ```

    ```ts
    // bad
    default export x.a;
    ```

    ```ts
    // bad
    function foo(x,y) {
        return x+y
    }
    default export foo;
    ```

    ```ts
    // good
    function foo(x:number,y:number):number {
        return x+y;
    }
    default export foo;
    ```

-   Default exports of identifiers that have not been defined with `const`, `let` or `var` :

    ```ts
    //bad
    a: number = 1;
    export const b = a;
    ```

-   Anything needed to be documented from `node_modules` will be documented as an identifier without further information about its type or JSDoc comment, only a reference from where it got imported.
 -->
</details>

## Contributing

I am open to suggestions/pull request to improve this program.

You will find the following commands useful:

-   Clones the github repository of this project:

    ```bash
    git clone https://github.com/lillallol/ts-doc-gen-md
    ```

-   Installs the node modules (nothing will work without them):

    ```bash
    npm install
    ```

-   Tests the source code:

    ```bash
    npm run test
    ```

-   Lints the source folder using typescript and eslint:

    ```bash
    npm run lint
    ```

-   Builds the typescript code from the `./src` folder to javascript code in `./dist`:

    ```bash
    npm run build-ts
    ```

-   Creates the CLI executable of this program in `./bin/bin.js`:

    ```bash
    npm run build-bin
    ```

    Make sure that the `./dist` exists when you execute this command, otherwise it will not work.

-   Injects in place the generated toc and imported files to `README.md`:

    ```bash
    npm run build-md
    ```

-   Checks the project for spelling mistakes:

    ```bash
    npm run spell-check
    ```

    Take a look at the related configuration `./cspell.json`.

-   Checks `./src` for dead typescript files:

    ```bash
    npm run dead-files
    ```

    Take a look at the related configuration `./unimportedrc.json`.

### Terminology

Here I define the terminology used in the source code, and give simple examples when necessary.

#### chain export statement

```ts
export * from "./some/where";
export * as x from "./some/where";
export { A, b as B, default as C, default } from "./some/where";
export { A, b as B, c as default };
export default foo;
```

#### delegation export statement

```ts
export * from "./some/where";
```

#### namespace export statement

```ts
export * as x from "./some/where";
```

#### named export path full

```ts
export { A, b as B, default as C, default } from "./some/where";
```

#### named export path less

```ts
export { A, b as B, c as default };
```

#### default export chain

```ts
export default foo;
```

#### export statement non chain

```ts
export function foo() {}
export class A {
    constructor() {}
}
export const a = 1,
    b = 2;
export interface I {}
export type obj = { a: number; b: string };
export enum Country {
    Germany,
    Sweden,
    USA,
}
```

Even without the export keyword, the previous statements are still referred as export statement non chain.

```ts
export default function foo() {}
export default class A {
    constructor() {}
}
export default const a = 1;
export default interface I {

}
```

#### export chain leaf statement

These are the statements that were located while resolving the public api but can not be resolved more deeply, i.e. : non chain export statements, chain exports and imports from node modules.

#### export statement

Non chain, and export export statements.

#### resolution index

Given the following statement :

<!-- prettier-ignore -->
```ts
export const a: number = 1, b: string = "1";
//           0,             1
```

or :

```ts
import D, { A, b as B, default as C } from "./some/where";
//     0,   1,      2,            3
```

the resolution index defines at which one of the values we are interested in.

#### statement index

Given a file, the statement index corresponds to the index of the statement we are interested in.
For example :

```ts
"hello world"; //statement index 0
export * from "./some/where"; //statement index 1

function foo() {} //statement index 2
```

#### entry point file

The entry point `.d.ts` file of the project to be documented.

#### resolve export statement

A chain export statement corresponds to a set of non chain export statements. Resolving an export statement means, finding this set.

#### documentation node

For each non chain export statements that is made public from the entry point file, a documentation node is created with all the necessary information needed to create a human readable documentation.

#### documentation reference node

Some statements that correspond to documentation nodes, reference other statements in their type signature. For each referenced statement, a documentation reference node is created.

### How it works

The typescript abstract syntax tree (ast) parser from the typescript node module is used to parse the typings entry point file. Export statements are located. Those that are chain exports get resolved to non chain exports. After that the abstract syntax tree of each statement is iterated. The iteration serves two purposes:

-   create the documentation string of the statement
-   locate the referenced types, resolve them to their non chain export statements and recursively apply to them the same steps

### Help needed

The chain export to non chain export resolution was coded from scratch and it is also used to resolve the statements of type references. It was really tedious to code that. If someone knows any similar built in functionality in the typescript node module, then feel free to inform me. Take into account that this functionality also resolves the namespaces and the exposed name to the public api.

## Changelog

### 0.0.0

First publish.

## License

MIT
