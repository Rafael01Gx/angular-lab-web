const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  /**
   * =========================
   * TypeScript / Angular TS
   * =========================
   */
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      /* =========================
       * Angular selectors
       * ========================= */
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],

      /* =========================
       * 🔥 CRÍTICOS – Runtime / Bugs
       * ========================= */
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
      "no-unsafe-optional-chaining": "error",
      "no-prototype-builtins": "error",
      "@typescript-eslint/no-unused-expressions": "error",

      /* =========================
       * ⚠️ QUALIDADE / MANUTENÇÃO
       * ========================= */
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      /**
       * ❌ NÃO remover tipagem explícita
       * (essencial para código corporativo)
       */
      "@typescript-eslint/no-inferrable-types": "off",

      /* =========================
       * 🧭 Angular moderno (sem risco)
       * ========================= */
      "@angular-eslint/prefer-inject": "warn",
    },
  },

  /**
   * =========================
   * Angular Templates (HTML)
   * =========================
   */
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      /* =========================
       * 🎨 Acessibilidade (não crítico)
       * ========================= */
      "@angular-eslint/template/label-has-associated-control": "warn",
      "@angular-eslint/template/click-events-have-key-events": "warn",
      "@angular-eslint/template/interactive-supports-focus": "warn",

      /* =========================
       * Angular 17+ control flow
       * ========================= */
      "@angular-eslint/template/prefer-control-flow": "warn",
    },
  },
]);
