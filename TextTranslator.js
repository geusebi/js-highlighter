
import Translator from './Translator';

export default TextTranslator;

function TextTranslator(spec={}) {
    let t = Translator(spec);

    t.convert("(unknown)", (token) => token.lexeme);

    return Object.assign(t, {
        translate
    });

    /* Translate 'source' by tokenizing using the suite's scanner
    and transforming the tokens with the suite's transformer.
    Return the translated source as a string.
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
