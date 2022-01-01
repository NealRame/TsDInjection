module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 13,
        "sourceType": "module",
    },
    "plugins": [
        "@typescript-eslint",
    ],
    "rules": {
        "comma-dangle": ["warn", "only-multiline"],
        indent: ["warn", 4],
        semi: ["warn", "never"],
        "space-before-function-paren": ["warn", {
            anonymous: "always",
            asyncArrow: "always",
            named: "never",
        }],
        "space-in-parens": "off",
        "key-spacing": ["error", { mode: "minimum" }],
        "space-infix-ops": ["off"],
        "operator-linebreak": ["off"],
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-multi-spaces": ["off"],
        quotes: ["warn", "double"],
        "no-use-before-define": "off",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-use-before-define": ["error"],
        "@typescript-eslint/no-useless-constructor": ["error"]
    }
}
