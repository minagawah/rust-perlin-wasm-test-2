module.exports = {
  "parser":  "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": "plugin:@typescript-eslint/recommended",
  "env": {
    "browser": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "overrides": [
    {
      "files": ["**/*.ts"],
      "rules": {
        "@typescript-eslint/explicit-function-return-type": [0],
        "@typescript-eslint/indent": ["error", 2],
        "@typescript-eslint/no-var-requires": [1]
      }
    }
  ],
};
