module.exports = {
    extends: "kano",
    parserOptions: {
        "ecmaVersion": 2017,
    },
    env: {
        "node": true
    },
    globals: {
        "LOGGER": true
    },
    rules: {
        'prefer-destructuring':0,
        'import/no-unresolved':0,
        'import/no-extraneous-dependencies':0,
        'no-underscore-dangle':0,
        'no-bitwise':0,
        'object-curly-newline':0
    }
};
