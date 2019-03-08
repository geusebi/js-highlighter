
import Translator from './Translator.js';

export default HTMLTranslator;
export {
    element,
    text,
    mark_newlines
};

/* Create an html translator. */
function HTMLTranslator(specs={}) {
    /* Extends 'Translator'. */
    let t = Translator(specs);

    /* If there's no matching rule defaults to text node. */
    t.convert("(unknown)", text());

    /* Exposed API */
    return Object.assign(t, {
        translate,
        highlight,
    });

    /* Translate a string 'source' in a 'DocumentFragment'
    according to the scanner and the transformer.
    'doc' is the document used to create the html
    fragment, elements and text nodes.
    */
    function translate(source, doc) {
        let {iter_tokens} = t.scanner;
        let {transform} = t.transformer;

        let fragment = doc.createDocumentFragment();
        let tokens = iter_tokens(source);
        for (const token of tokens) {
            fragment.appendChild(transform(token, doc));
        }

        fragment.normalize();
        return fragment;
    }

    /* Substitute element's content with its translation.
    If 'escape_entities' is false (default) let the browser
    itself resolve every html entity to its corresponding
    character.
    The actual source to be highlighted is the first
    child of 'elem' and it should be a text node.
    */
    function highlight(elem, escape_entities=false) {
        let input;
        /* todo: Mmh.. is this the correct way to escape?
        const has_children = elem.childNodes.length !== 0;
        if (escape_entities === false && has_children) {
            input = elem.childNodes[0].nodeValue;
        */
        if (escape_entities === false) {
            input = elem.textContent;
        } else {
            input = elem.innerHTML;
        }

        /* todo: This should fail badly if 'doc' is not valid.
        And, probably, we should wrap the translation in
        a try-catch block.
        */
        let doc = elem.ownerDocument || document;
        let output = translate(input, doc);
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
        elem.append(output);
    }
}

/* Create an element factory for a specific 'tag'.
If 'class_id' is true, class is set to 'token.id'.
*/
function element(tag, class_id=true) {
    return (token, doc) => {
        let {id, lexeme} = token,
            elem = doc.createElement(tag),
            content = doc.createTextNode(lexeme);

        elem.appendChild(content);
        if (class_id) {
            elem.classList.add(id);
        }

        return elem;
    };
}

/* Create a text node. */
function text() {
    return (token, doc) =>
        doc.createTextNode(token.lexeme);
}

/* Search and replace newlines with a given Element 'nl'.
If 'nl' is undefined it will default to 'SPAN.newline'.
*/
function mark_newlines(elem, nl) {
    let ref_doc = elem.ownerDocument;

    /* A cloneable Element.
    Clones will wrap newlines literals.
    */
    if (nl === undefined) {
        nl = ref_doc.createElement("SPAN");
        nl.classList.add("newline");
    }

    /* A textNodes iterator as per DOM2 spec. */
    let iter_text = ref_doc.createNodeIterator(
        elem, NodeFilter.SHOW_TEXT
    );

    /* Partition a string in three components:
    (before) (LF CR CRLF) (after)
    */
    let nl_re = /(.*?)(\n|\r\n?)([^]*)/m;

    let node;
    while (node = iter_text.nextNode()) {
        let content = node.textContent;
        let match = content.match(nl_re);
        if (!match) {
            continue;
        }

        let [_, text, nl_text, rest] = match;
        /* Preserve the very same newline string. */
        let nl_elem = nl.cloneNode(true);
        nl_elem.append(nl_text);

        node.replaceWith(text, nl_elem, rest);
        /* Move forward on 'nl_text' (see below). */
        iter_text.nextNode();
        iter_text.nextNode();

        /*
        A glimpse of what is happening at the DOM level.
        Following the syntax of
        "DOM Level 2 Traversal and Range Specification":
        P: previous node, N: current node,
        t: text, n: nl_text, r: rest,
        []: reference node;

        loop start   ->  P  [N]
        replace      -> [P]  t   n   r
        move forward ->  P   t  [n]  r
        next loop    ->  P   t   n  [r]
        */
    }
}
