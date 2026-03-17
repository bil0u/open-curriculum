import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { flatConfigs as importXFlatConfigs } from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { config, configs } from "typescript-eslint";

export default config(
  { ignores: ["dist", "node_modules", "playwright-report", "test-results"] },
  js.configs.recommended,
  ...configs.strict,
  jsxA11y.flatConfigs.recommended,
  importXFlatConfigs.recommended,
  importXFlatConfigs.typescript,
  eslintConfigPrettier,
  {
    rules: {
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "builtin",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import-x/no-default-export": "error",
    },
  },
  {
    files: ["*.config.ts", "src/test-setup.ts"],
    rules: {
      "import-x/no-default-export": "off",
    },
  },
);
