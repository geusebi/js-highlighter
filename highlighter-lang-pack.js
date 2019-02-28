
import {HTMLTranslator} from './highlighter.js';

const suites = {};

/* Javascript
only major functionality - non compliant */
{
    suites.js = HTMLTranslator();
    // Aliases and helpers
    const {token, convert, element} = suites.js;
    const to_span = element("span");

    /* Keywords need to lookahead one char to check if there
    is an actual match. */
    const keywords = (
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
        "while|with|yield)[^a-z]"
    );

    token("space", /\s+/); // White space

    /* Single and multi line comments */
    token("comment", /\/\/.*$/m);
    token("comment", /\/\*[^]*?\*\//m);

    /* Keywords and names */
    token("keyword", RegExp(keywords), 1);
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

    token("char", (source, i) => source[i]); // Any other char

    /* Any interesting token is converted to a span element
    with class equal to the token's id */
    convert(
        ["keyword", "number", "comment", "quoted", "operator"],
        to_span
    );
}

/* Python
only major functionality - non compliant */
{
    suites.py = HTMLTranslator();
    // Aliases and helpers
    const {token, convert, element} = suites.py;
    const to_span = element("span");

    /* Keywords need to lookahead one char to check if there
    is an actual match. */
    const keywords = (
        "(False|None|True|and|as|assert|async|await|" +
        "break|class|continue|def|del|elif|else|" +
        "except|finally|for|from|global|if|import|" +
        "in|is|lambda|nonlocal|not|or|pass|raise|" +
        "return|try|while|with|yield)[^a-z]"
    );

    token("space", /\s+/); // White space

    /* Single and multi line comments */
    token("comment", /#.*$/m);

    /* Keywords and names */
    token("keyword", RegExp(keywords), 1);
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

    token("char", (source, i) => source[i]); // Any other char

    /* Any interesting token is converted to a span element
    with class equal to the token's id */
    convert(
        ["keyword", "number", "comment", "quoted"],
        to_span
    );
}

/* CLI
bash-like with optional username */
{
    suites.cli = HTMLTranslator();
    // Aliases and helpers
    const {token, convert, element} = suites.cli;
    const to_span = element("span");

    /* Optional username in parenthesis followed by $ or # */
    token("prompt", /^(\([a-z][a-z\d]*\))? [\$#] /im);

    /* If at line start, eat up everything to line end */
    token("stdout", /^.*\n/im);

    /* If in the middle of a line, eat up everything to line
    end or, if the line ends with a \, eat next line too */
    token("command", /[^]*?[^\\]\n/im);

    token("char", (source, i) => source[i]); // Any other char

    /* Any interesting token is converted to a span element
    with class equal to the token's id */
    convert(["prompt", "stdout", "command"], to_span);
}

export {
    suites
};