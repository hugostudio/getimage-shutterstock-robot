export default {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.json",
  },
  extends: [
    "airbnb-base", // Adicionaas regras do Airbnb Style Guide
    "plugin:@typescript-eslint/recommended", // Adiciona as recomendações padrões @typescript-eslint/eslint-plugin
    "plugin:prettier/recommended", // Adiciona o plugin do prettier
  ],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
  },
};
