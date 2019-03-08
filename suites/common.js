
import Transformer from '../Transformer.js';
import {element, text} from '../HTMLTranslator.js';

/* Any interesting token is converted to a SPAN element
with class equal to the token's id. */
let to_span = element("span", true);

/* Convert to text node. */
let to_text = text();

/* A plain html transformer for some selected token ids. */
let simple_transformer = Transformer();
simple_transformer.add(
    ["keyword", "number", "comment", "quoted", "operator"],
    to_span
);
simple_transformer.add("(unknown)", to_text);

export {
    simple_transformer,
    to_span,
    to_text
};
