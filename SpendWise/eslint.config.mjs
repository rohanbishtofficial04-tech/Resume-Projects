import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/components/spendwise/ProfilePage.tsx",
      "src/components/spendwise/Shared.tsx",
      "src/components/spendwise/SpendWiseProvider.tsx",
      "src/hooks/use-mobile.ts",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["src/components/ui/sidebar.tsx"],
    rules: {
      "react-hooks/purity": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
];

export default eslintConfig;
