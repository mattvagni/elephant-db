module.exports = {
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        node: true,
        es6: true,
        browser: true
    },
    globals: {
        test: true,
        expect: true,
        describe: true,
        beforeEach: true
    },
    rules: {
        'brace-style': [2, '1tbs'],
        'camelcase': [2, {'properties': 'never'}],
        'comma-dangle': [2, 'never'],
        'comma-spacing': 2,
        'comma-style': [2, 'last'],
        'curly': 2,
        'eol-last': 2,
        'func-style': [2, 'declaration'],
        'indent': [2, 4, {'SwitchCase': 1}],
        'key-spacing': 2,
        'keyword-spacing': 2,
        'max-depth': [2, 2],
        'max-nested-callbacks': 2,
        'no-func-assign': 2,
        'no-inline-comments': 2,
        'no-inner-declarations': 2,
        'no-lonely-if': 2,
        'no-multi-spaces': 2,
        'no-new': 2,
        'no-shadow': 2,
        'no-spaced-func': 2,
        'no-undef': 2,
        'no-unused-vars': 2,
        'no-use-before-define': [2, 'nofunc'],
        'one-var': [2, 'never'],
        'quotes': [2, 'single', 'avoid-escape'],
        'semi': [2, 'always'],
        'space-before-function-paren': [2, {'anonymous': 'never', 'named': 'never'}],
        'space-infix-ops': 2,
        'spaced-comment': [2, 'always'],
        'strict': [2, 'never'],
        'no-var': 2,
        'prefer-const': 2
    }
};
