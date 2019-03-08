
/* Any interesting token is converted to a span element
with class equal to the token's id */

import Transformer from '../Transformer.js';
import {element} from '../HTMLTranslator.js';

let to_span = element("span");

let simple_transformer = Transformer();
simple_transformer.add(
    ["keyword", "number", "comment", "quoted", "operator"],
    to_span
);

export {
    simple_transformer,
    to_span
};