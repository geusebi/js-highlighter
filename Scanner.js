
import Token from './Token.js';

export default Scanner;

/* Create a new scanner. */
function Scanner(patterns_list=[]) {
    const patterns = patterns_list;

    /* Exposed API */
    return {
        add,
        iter_tokens,
        on_match
    };

    /* Add a function or a regex to the list of patterns.
    'func_or_re' could be valid pattern matching function
    (see Pattern function definition) or a regex with an optional
    capturing index (see '_from_regex').
    */
    function add(id, func_or_re, index) {
        let pattern = func_or_re;
        if (func_or_re instanceof RegExp) {
            pattern = _from_regex(func_or_re, index);
        }
        patterns.push([id, pattern]);
    }

    /* Convert a regex to a pattern function.
    'index' controls which capturing group is the actual lexeme.
    If not given the whole matching string is the lexeme.
    */
    function _from_regex(re, index=0) {
        const re_y = RegExp(re, re.flags + "y");
        return function (source, i) {
            re_y.lastIndex = i;
            const match = source.match(re_y);
            if (match /* !== null */) {
                return match[index] || "";
            }
            return undefined;
        };
    }

    /* A function called after every successful pattern match.
    The default one does nothing. It is meant to be substituted by
    assigning a new one directly to 'scanner.on_match'. It could be
    used to implement more complex behaviour (e.g. backtracking).
    */
    function on_match(token, context) {}

    /* Iterator of tokens over a given source.

    Rules of the game:
    - No patterns is ever run if there is no more input to consume,
    - first token is always <"(start)">,
    - patterns are run from first to last,
    - first pattern to match emit the token and restart the cycle,
    - an empty match emit the token but does not restart the cycle,
    - if there's no match at the current position then emit a
        token <"(unmatched)", current char> to signal an error,
    - last token is always <"(end)">,
    - a 'context' object is shared by all the patterns,
    - 'on_match(token, context)' is called after each emitted token
        (except for '(start)', '(end)' and '(unmatched)').
    */
    function* iter_tokens(source, context={}) {
        let i = 0, guard, lexeme, token;

        yield Token("(start)", "", i);
        while (i < source.length) {
            guard = i;
            for (const [id, pattern] of patterns) {
                lexeme = pattern(source, i, context);
                if (lexeme === undefined) {
                    continue;
                }

                token = Token(id, lexeme, i);
                yield token;
                on_match(token, context);
                i += lexeme.length;

                if (lexeme.length !== 0) {
                    break;
                }
            }

            if (guard == i) {
                yield Token("(unmatched)", source[i], i);
                i += 1;
            }
        }
        yield Token("(end)", "", i);
    }
}
