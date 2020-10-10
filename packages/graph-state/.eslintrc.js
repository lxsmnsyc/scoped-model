module.exports = {
  "extends": [
    'lxsmnsyc/typescript',
  ],
  "parserOptions": {
    "project": "./tsconfig.eslint.json",
    "tsconfigRootDir": __dirname,
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "no-param-reassign": "off",
  },
};

