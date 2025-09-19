import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "react/no-unknown-property": [
        "error",
        {
          ignore: ["jsx", "global"]
        }
      ]
    }
  },
  {
    files: ["**/*.tsx", "**/*.ts"],
    ignores: ["**/playground/**", "**/ProgressBar.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='style']",
          message: "Inline styles are not allowed. Use Tailwind classes or design tokens instead."
        }
      ]
    }
  }
];

export default eslintConfig;