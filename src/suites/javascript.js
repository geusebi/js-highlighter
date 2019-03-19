
import HTMLTranslator from '../HTMLTranslator.js';
import {simple_transformer} from './common.js';

/* Javascript
only major functionality - non compliant */

let javascript = HTMLTranslator({
    transformer: simple_transformer
});

let {token} = javascript;

/* Keywords need to lookahead one char to check if there
is an actual match. */
let keywords = RegExp(
    "(abstract|arguments|await|boolean|break|" +
    "byte|case|catch|char|class|const|" +
    "continue|debugger|default|delete|do|" +
    "double|else|enum|eval|export|extends|" +
    "false|final|finally|float|for|function|" +
    "goto|if|implements|import|in|instanceof|" +
    "int|interface|let|long|native|new|" +
    "null|package|private|protected|public|" +
    "return|short|static|super|switch|" +
    "synchronized|this|throw|throws|transient|" +
    "true|try|typeof|var|void|volatile|" +
    "while|with|yield)(?=[^a-z])"
);

token("space", /\s+/); // White space

/* Single and multi line comments */
token("comment", /\/\/.*$/m);
token("comment", /\/\*[^]*?\*\//m);

/* Keywords and names */
token("keyword", keywords);
token("name", /[a-z_][a-z\d_]*/i);

/* Binaries, octals, hexadecimals and numbers
(with and without E part) */
token("number", /0b[01]+|0o[0-7]+|0x[\dA-F]+/i);
token("number", /\d+(\.\d*)?(E[+-]?\d+)?/i);
token("number", /\.\d+(E[+-]?\d+)?/i);

/* Quoted text of type double, single and tick.
Non-standard: it will swallow newlines and other
invalid characters too. */
token("quoted", /"(\\.|[^"])*?"/);
token("quoted", /'(\\.|[^'])*?'/);
token("quoted", /`(\\.|[^`])*?`/);

/* Any operators of any length.
Non-standard: invalid and non existent operators */
token("operator", /[=<>!*&|\/%^+-][=<>&|]*/);

token("char", (source, i) => [source[i], i]); // Any other char

export default javascript;
