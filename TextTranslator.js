
import Translator from './Translator';

export default TextTranslator;

/* Create an text transformer. */
function TextTranslator(spec={}) {
    /* Extends 'Translator'. */
    let t = Translator(spec);

    /* If there's no matching rule defaults to plain text. */
    t.convert("(unknown)", (token) => token.lexeme);

    /* Exposed API */
    return Object.assign(t, {
        translate
    });

    /* Translate a string 'source' in a 'DocumentFragment'
    according to the scanner and the transformer.
    */
    function translate(source) {
        const {transform} = t.transformer;

        const tokens = scanner.iter_tokens(source);
        const parts = [];
        for (const token of tokens) {
            parts.push(transform(token));
        }
        return parts.join("");
    }
}
