
export default Token;

/* Token data structure. */
function Token(id, lexeme, pos) {
    return {
        id,
        lexeme,
        pos
    };
}