
import Scanner from './Scanner.js';
import Transformer from './Transformer.js';

export default Translator;

/* Create a translator. */
function Translator(specs={}) {
    let {scanner, transformer} = specs;

    if(!scanner) {
        scanner = Scanner();
    }

    if(!transformer) {
        transformer = Transformer();
    }

    /* Exposed API
    'translator.token' and 'translator.convert' is
    sugar to ease adding patterns and rules.
    */
    return {
        scanner,
        transformer,
        translate,
        token: scanner.add,
        convert: transformer.add
    };

    /* To be implemented in derived classes. */
    function translate() {
        throw Error("unimplemented");
    }
}
