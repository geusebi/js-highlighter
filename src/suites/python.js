
import HTMLTranslator from '../HTMLTranslator.js';
import {simple_transformer} from './common.js';

/* Python
only major functionality - non compliant */

let python = HTMLTranslator({
    transformer: simple_transformer
});

let {token} = python;

/* Keywords need to lookahead one char to check if there
is an actual match. */
let keywords = RegExp(
    "(False|None|True|and|as|assert|async|await|" +
    "break|class|continue|def|del|elif|else|" +
    "except|finally|for|from|global|if|import|" +
    "in|is|lambda|nonlocal|not|or|pass|raise|" +
    "return|try|while|with|yield)(?=[^a-z])"
);

token("space", /\s+/); // White space

/* Single and multi line comments */
token("comment", /#.*$/m);

/* Keywords and names */
token("keyword", keywords);
token("name", /[a-z_][a-z\d_]*/i);

/* Binaries, octals, hexadecimals and numbers
(with and without E part or J) */
token("number", /0b[01]+|0o[0-7]+|0x[\da-f]+/i);
token("number", /\d+(\.\d*)?(E[+-]?\d+)?J?/i);
token("number", /\.\d+(E[+-]?\d+)?J?/i);

/* Quoted text of type double and single in both forms
of one or triple char.
Non-standard: it will swallow newlines and other
invalid characters too. */
token("quoted", /"(\\.|[^"])*?"/);
token("quoted", /'(\\.|[^'])*?'/);
token("quoted", /"""([^]*?[^\\])?"""/m);
token("quoted", /'''([^]*?[^\\])?'''/m);

export default python;
