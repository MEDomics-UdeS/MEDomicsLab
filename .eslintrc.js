module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {
    camelcase: ["error"],
    "quote-props": ["error", "consistent"],
    "react/prop-types": ["off"],
    "no-mixed-spaces-and-tabs": ["error", "smart-tabs"]
    // "prettier/prettier": "error"
  }
}
