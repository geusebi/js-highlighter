
import HTMLTranslator from '../HTMLTranslator.js';
import {to_span} from './common.js';

/* CLI
bash-like with optional username */

let cli = HTMLTranslator();

let {token, convert} = cli;

/* Optional username in parenthesis followed by $ or # */
token("prompt", /^(\([a-z][a-z\d]*\))? [\$#] /im);

/* If at line start, eat up everything to line end */
token("stdout", /^.*\n/im);

/* If in the middle of a line, eat up everything to line
end or, if the line ends with a \, eat next line too */
token("command", /[^]*?[^\\]\n/im);

/* Any interesting token is converted to a span element
with class equal to the token's id */
convert(["prompt", "stdout", "command"], to_span);

export default cli;