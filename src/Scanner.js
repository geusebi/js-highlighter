
import Token from './Token.js';

export default Scanner;
export {
    pattern_from_regex
};

/* Create a scanner. */
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
    (see Pattern function definition) or a regex
    (see 'pattern_from_regex').
    */
    function add(id, func_or_re) {
        let pattern = func_or_re;
        if (func_or_re instanceof RegExp) {
            pattern = pattern_from_regex(func_or_re);
        }
        patterns.push([id, pattern]);
    }

    /* A function called after every successful pattern match.
    The default one does nothing. It is meant to be substituted by
    assigning a new one directly to 'scanner.on_match'.
    It takes the matched token and the context object shared
    between patterns. It could be used to implement more complex
    behaviour (e.g. backtracking).
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
        token <"(unmatched)", current char>,
    - last token is always <"(end)">,
    - a 'context' object is shared by all the patterns,
    - 'on_match(token, context)' is called after each emitted token
        (except for '(start)', '(end)'),
    - if a pattern moves the position backwards relative to the last
      matched token then throw an error.
    */
    function* iter_tokens(source, context={}) {
        let i = 0, guard, lexeme, l_idx, match, token;

        yield Token("(start)", "", i);
        while (i < source.length) {
            guard = i;
            for (const [id, pattern] of patterns) {
                match = pattern(source, i, context);
                if (match === undefined) {
                    continue;
                }
                [lexeme, l_idx] = match;

                token = Token(id, lexeme, l_idx);
                i = l_idx + lexeme.length;
                on_match(token, context);

                yield token;

                if (lexeme.length !== 0) {
                    break;
                }
            }

            if (guard > i) {
                throw Error("scanner went backwards");
            }

            if (guard == i) {
                yield Token("(unmatched)", source[i], i);
                i += 1;
                on_match(token, context);
            }
        }
        yield Token("(end)", "", i);
    }
}

/* Convert a regex to a proper pattern function
(see Pattern function definition).
*/
function pattern_from_regex(re) {
    const re_y = RegExp(re, re.flags + "y");
    return function (source, i) {
        re_y.lastIndex = i;
        const match = source.match(re_y);
        if (match /* !== null */) {
            return [match[0], match.index];
        }
        return undefined;
    };
}

/* todo: add comment for Pattern function definition. */