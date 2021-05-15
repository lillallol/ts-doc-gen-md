import { ExportChainLeaf } from "../ts-ast-resolve/index";

/**
 * @description
 * When creating the documentation of the type signature of a value, there might be
 * type references in it. They are added in this singleton.
 * It is a wise choice to map to export chain leaf, because it simplifies things very much.
 * When it is realized that a documentation reference node has to be a documentation node
 * there is no need to do any change here.
 */
export type referencedTypes = {
    [referenceIdentifier: string]: ExportChainLeaf;
};
