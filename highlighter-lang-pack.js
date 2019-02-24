
import {HTMLTranslator} from './highlighter.js';

const suites = {};

// Javascript
{
    suites.js = HTMLTranslator();
    const {token, convert, element} = suites.js;
    const to_span = element("span");

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

    token("space", /\s+/);

    token("keyword", RegExp(keywords), 1);
    token("name", /[a-z_][a-z\d_]*/i);

    token("number", /0b[01]+|0o[0-7]+|0x[\dA-F]+/i);
    token("number", /\d+(\.\d*)?(E[+-]?\d+)?/i);
    token("number", /\.\d+(E[+-]?\d+)?/i);

    token("comment", /\/\/.*$/m);
    token("comment", /\/\*[^]*?\*\//m);

    token("quoted", /"(\\.|[^"])*?"/);
    token("quoted", /'(\\.|[^'])*?'/);
    token("quoted", /`(\\.|[^`])*?`/);

    token("operator", /[=<>!*&|\/%^+-][=<>&|]*/);

    token("char", (source, i) => source[i]);

    convert(
        ["keyword", "number", "comment", "quoted", "operator"],
        to_span
    );
}

// Python
{
    suites.py = HTMLTranslator();
    const {token, convert, element} = suites.py;
    const to_span = element("span");

    let keywords = (
        "(False|None|True|and|as|assert|async|await|" +
        "break|class|continue|def|del|elif|else|" +
        "except|finally|for|from|global|if|import|" +
        "in|is|lambda|nonlocal|not|or|pass|raise|" +
        "return|try|while|with|yield)[^a-z]"
    );

    token("keyword", RegExp(keywords), 1);

    token("name", /[a-z_][a-z\d_]*/i);

    token("number", /0b[01]+|0o[0-7]+|0x[0-9a-f]+/i);
    token("number", /\d+(\.\d*)?(E\d+)?J?/i);
    token("number", /\.\d+(E\d+)?J?/i);

    token("comment", /#.*$/m);
    token("comment", /"""([^]*?[^\\])?"""/m);

    token("quoted", /"(\\.|[^"])*?"/);
    token("quoted", /'(\\.|[^'])*?'/);

    token("space", /\s+/);

    token("char", (source, i) => source[i]);

    convert(
        ["keyword", "number", "comment", "quoted"],
        to_span
    );
}

// CLI
// bash-like with optional username of the form '(name) $'
{
    suites.cli = HTMLTranslator();
    const {token, convert, element} = suites.cli;
    const to_span = element("span");

    token("prompt", /^(\([a-z][a-z0-9]*\))? [\$#] /im);
    token("stdout", /^.*\n/im);
    token("command", /[^]*?[^\\]\n/im);
    token("char", (source, i) => source[i]);

    convert(["prompt", "stdout"], to_span);
}

export {
    suites
};