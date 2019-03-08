
export default Transformer;

/* Create a new transformer. */
function Transformer(rules_dict={}) {
    let rules = rules_dict;

    /* If there's no matching rule then leave token as is. */
    add("(unknown)", (token) => token);

    /* Exposed API */
    return {
        add,
        transform
    };

    /* If it exists a rule matching the token then transform it
    accordingly. Else apply the '(unknown)' rule.
    */
    function transform(token, ctx) {
        if (rules.hasOwnProperty(token.id)) {
            return rules[token.id](token, ctx);
        }
        return rules["(unknown)"](token, ctx);
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
