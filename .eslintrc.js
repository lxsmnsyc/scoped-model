module.exports = {
    env: {
      browser: true,
      es6: true,
      node: true,
    },
    extends: [
      'plugin:react/recommended',
      'airbnb',
      'airbnb/hooks',
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:import/typescript",
    ],
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: "./tsconfig.json",
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    plugins: [
      'react',
      '@typescript-eslint',
    ],
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          "js": "never",
          "jsx": "never",
          "ts": "never",
          "tsx": "never"
        }
      ],
      "react/jsx-filename-extension": [1, { "extensions": [".jsx", ".tsx"] }],
      "react/jsx-props-no-spreading": "off",
    },
  };
  