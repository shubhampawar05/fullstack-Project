import nextPlugin from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = [
  ...nextPlugin,
  prettierConfig,
  {
    ignores: [".next/**", "out/**", "build/**", "dist/**", "node_modules/**"],
  },
];

export default eslintConfig;
