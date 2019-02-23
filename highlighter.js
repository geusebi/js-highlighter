
/*
Simple token-based code highlighting.

SUGGESTION
Read the SHORT SUMMARY and the SHORT EXAMPLE at the end of
the source code to get a general idea of how everything
works. Then read the actual code to understand the details.
Languages pack is a good set of examples too.
*/

/* Token data structure. */
function Token(id, lexeme, pos) {
    return {
        id,
        lexeme,
        pos
    };
}


/* Create a new scanner. */
function Scanner(patterns_list=[]) {
    const patterns = patterns_list;

    /* Exposed API */
    return {
        add,
        iter_tokens,
        on_match
    };

    /* Add a function or regex to the list of patterns.
    The pattern will try to match tokens of type 'id'.
    'func_or_re' could be a regex with an optional
    capturing index (see '_from_regex'); or could be a
    function of the form
    (source, position, context) => "token string".
    'context' is an object shared between patterns.
    */
    function add(id, func_or_re, index) {
        let pattern = func_or_re;
        if (func_or_re instanceof RegExp) {
            pattern = _from_regex(func_or_re, index);
        }
        patterns.push([id, pattern]);
    }

    /* A function called after every successful pattern match.
    The default one only stores the last token.
    It is meant to be substituted by assigning a new one
    directly to 'scanner.on_match'. It could be used to
    implement more complex behaviour (e.g. backtracking).
    */
    function on_match(token, context) {
        context.last = token;
    }

    /* Iterator of tokens over a given source.

    Rules of the game:
    - No patterns is ever called if there is no more input
      to consume,
    - first token is always <"(start)">,
    - patterns are run from first to last to match a token,
    - if a matching token is the empty string then a token of
      the form <"(empty)"> is generated to signal an error,
    - if no patterns match at the given position then a token
      of the form <"(unmatched)", current char> is generated,
    - last token is always <"(end)">,
    - a 'context' object is shared by all the patterns,
    - 'on_match(token, context)' is called after each
    matched token (except '(start)' and '(end)').
    */
    function* iter_tokens(source, context={}) {
        let i = 0, guard, lexeme, token;

        yield Token("(start)", "", i);
        while (i < source.length) {
            guard = i;
            for (const [id, pattern] of patterns) {
                lexeme = pattern(source, i, context);
                if (!lexeme) {
                    continue;
                }

                if (lexeme.length != 0) {
                    token = Token(id, lexeme, i);
                    i += lexeme.length;
                    break;
                }

                token = Token("(empty)", "", i);
            }

            if (guard == i) {
                token = Token("(unmatched)", source[i], i);
                i += 1;
            }

            yield token;
            on_match(token, context);
        }
        yield Token("(end)", "", i);
    }

    /* Convert a regex to a suitable pattern.
    'index' controls which capturing group is the actual
    lexeme. If not given the whole matching string is
    returned.
    */
    function _from_regex(re, index=0) {
        const re_y = RegExp(re, re.flags + "y");
        return function (source, i) {
            re_y.lastIndex = i;
            const match = source.match(re_y);
            if (match) {
                return match[index];
            }
        }
    }
}


/* Create a new transformer. */
function Transformer(rules_dict) {
    let rules = rules_dict;

    if (!rules) {
        rules = {};
    }

    /* If there's no matching rule then leave token as is. */
    add("(unknown)", (token) => token);

    /* Exposed API */
    return {
        add,
        transform
    };

    /* If it exists a rule matching the token then transform
    it accordingly. Else apply the '(unknown)' rule.
    */
    function transform(token) {
        if (rules.hasOwnProperty(token.id)) {
            return rules[token.id](token);
        }
        return rules["(unknown)"](token);
    }

    /* Add a rule to the dictionary.

    'id_or_list' could be either an 'id' or a list of 'id's.
    'func' is a function of the form (token) => new_token.
    */
    function add(id_or_list, func) {
        if (Array.isArray(id_or_list)) {
            for (const id of id_or_list) {
                rules[id] = func;
            }
        } else {
            rules[id_or_list] = func;
        }
    }
}


/* Create a new translator. */
function Translator(specs={}) {
    let {scanner, transformer} = specs;

    if(!scanner) {
        scanner = Scanner();
    }

    if(!transformer) {
        transformer = Transformer();
    }

    /* Exposed API
    'translator.token' and 'translator.convert' is sugar to
    ease adding patterns and rules.
    */
    return {
        scanner,
        transformer,
        translate,
        token: scanner.add,
        convert: transformer.add
    };

    /* Translate 'source' by tokenizing using the suite's
    scanner and transforming the tokens with the suite's
    transformer.
    Return the translated source as a string.
    */
    function translate(source) {
        const {transform} = transformer;

        const tokens = scanner.iter_tokens(source);
        const parts = [];
        for (const token of tokens) {
            parts.push(transform(token));
        }
        return parts.join("");
    }
}


/* Create an HTMLTranslator. */
function HTMLTranslator(specs={}) {
    const t = Translator(specs);

    /* If there's no matching rule defaults to text node. */
    t.convert("(unknown)", text);

    /* Exposed API */
    return Object.assign(t, {
        highlight,
        element,
        text,
        skip
    });

    /* Substitute element's content with its translation. */
    function highlight(elem) {
        const input = elem.innerHTML;
        return elem.innerHTML = t.translate(input);
    }

    /* Create an element factory for a specific 'tag'.
    If 'add_class' is true, class is set to 'token.id'.
    */
    function element(tag, add_class=true) {
        return (token) => {
            const {id, lexeme} = token;
            if (!add_class) {
                id = '';
            }
            return `<${tag} class='${id}'>${lexeme}</${tag}>`;
        }
    }

    /* Create a text node. */
    function text(token) {
        return token.lexeme;
    }

    /* Skip the token. */
    function skip(token) {
        return "";
    }
}


export {
    Token,
    Scanner,
    Transformer,
    Translator,
    HTMLTranslator
};

/*
Short Summary

- Use a variant of class free OOP style
- All APIs are simple objects
- Token:
    base data structure.
- Scanner:
    list of patterns,
    patterns are added with 'scanner.add',
    first matching patterns determine the token,
    a string is split in 'Token's by 'scanner.iter_tokens'.
- Transformer:
    dictionary of rules,
    rules are added with 'transformer.add',
    rules are applied with 'transformer.transform',
    a rule has a function which transform a token.
- Translator:
    also called a suite,
    combination of a scanner and a transformer,
    provide helper functions to add patterns and rules,
    a string is processed by 'translator.translate',
    translation if performed according to the suite.
- HTMLTranslator:
    extends 'Translator',
    add defaults and helpers to work with HTML elements.

Short example

    // Simple calculator suite
    const calc = HTMLTranslator();
    {
        const {token, convert, element} = calc;
        const to_bold = element("b", false);
        const to_italic = element("i", false);

        token("num", /\d+/);
        token("op", /[/*+-]/);

        convert("num", to_italic);
        convert("op", to_bold);
    }
    ---
    <PRE>5 * (3 + 2)</PRE>
    ---
    let elem = <select the PRE element>
    calc.highlight(elem);
    ---
    <PRE><i>5</i> <b>*</b> (<i>3</i> <b>+</b> <i>2</i>)</PRE>
*/
