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
    ignores: [
      "next.config.js",
      "next-env.d.ts",
      "scripts/**/*.js",
      "scripts/**/*.mjs",
      ".next/**",
      "node_modules/**",
      "public/**",
      "tailwind.config.js",
      
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_", 
        "varsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "error",
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
          selector: "JSXAttribute[name.name='style']:not([value.expression.type='AsExpression'])",
          message: "Inline styles are not allowed. Use Tailwind classes or design tokens instead. For dynamic values, use CSS custom properties with 'as React.CSSProperties'."
        }
      ]
    }
  }
  
];

export default eslintConfig;
