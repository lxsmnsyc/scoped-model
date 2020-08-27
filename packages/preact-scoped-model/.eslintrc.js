module.exports = {
  "extends": [
    "../../.eslintrc.js"
  ],
  "parserOptions": {
    "project": './tsconfig.json',
    "ecmaVersion": 2018,
    "sourceType": 'module',
    "tsconfigRootDir": __dirname,
  },
  "rules": {
    "react/prop-types": "off",
    // "react/react-in-jsx-scope": ""
  }
};