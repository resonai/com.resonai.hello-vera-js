module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  parser: 'vue-eslint-parser',
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    curly: ['error', 'all'],
    'no-console': 'off',
    'no-unused-vars': ['error', { destructuredArrayIgnorePattern: '^_', args: 'none' }],
    'no-unused-expressions': 'off',
    'standard/no-callback-literal': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/max-len': ['error', { code: 800, tabWidth: 2 }],
    'vue/multi-word-component-names': 'off',
    'vue/require-prop-types': 'off',
    'vue/no-template-shadow': 'off', // there is a bug in this rule elements.vue in scoped slots https://vuejs.org/guide/components/slots.html#scoped-slots
    'n/no-callback-literal': 'off',
    'operator-linebreak': ['error', 'after'],
    'multiline-ternary': ['error', 'always-multiline'],
    'vue/order-in-components': 'error',
    'vue/html-closing-bracket-spacing': 'error',
    'vue/html-end-tags': 'error',
    'vue/script-indent': ['error', 2, {
      switchCase: 1,
      baseIndent: 1
    }],
    quotes: ['error', 'single'],
    'vue/html-quotes': 'error',
    'vue/html-self-closing': 'error',
    'vue/mustache-interpolation-spacing': 'error',
    'vue/no-multi-spaces': 'error',
    'vue/no-spaces-around-equal-signs-in-attribute': 'error',
    'vue/v-bind-style': 'error',
    'vue/v-on-style': 'error',
    'vue/attributes-order': 'error',
    'vue/no-v-html': 'error',
    'vue/space-infix-ops': 'error',
    'node/no-callback-literal': 'off',
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 10
      },
      multiline: {
        max: 1
      }
    }],
    'vue/html-indent': ['error', 2, {
      attribute: 1,
      baseIndent: 1,
      closeBracket: 0,
      alignAttributesVertically: false,
      ignores: []
    }],
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'never'
    }],
    'object-shorthand': ['error', 'properties'],
    'vue/this-in-template': ['error', 'never'],
    'vue/template-curly-spacing': ['error', 'never'],
    'vue/eqeqeq': ['error'],
    'vue/comma-spacing': 'error',
    'vue/arrow-spacing': 'error',
    'vue/brace-style': 'error',
    'vue/camelcase': 'error',
    'vue/comma-dangle': 'error',
    'vue/comma-style': 'error',
    'vue/dot-notation': 'error',
    'vue/func-call-spacing': 'error',
    'vue/key-spacing': 'error',
    'vue/keyword-spacing': 'error',
    'vue/no-irregular-whitespace': 'error',
    'vue/object-curly-spacing': ['error', 'always'],
    'vue/space-in-parens': 'error',
    'vue/space-unary-ops': 'error'
  },
  overrides: [{
    files: ['**/*.ts'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended']
  }, {
    files: ['*.vue'],
    parser: 'vue-eslint-parser',
    rules: {
      indent: 'off'
    }
  }]
}
