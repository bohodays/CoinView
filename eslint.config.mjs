// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import boundaries from "eslint-plugin-boundaries";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// FSD(Feature-Sliced Design) 레이어: app > views > widgets > features > entities > shared
// 상위 레이어만 하위 레이어를 import할 수 있고, 역방향 import는 금지된다.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...storybook.configs["flat/recommended"],
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "app/*" },
        { type: "views", pattern: "views/*" },
        { type: "widgets", pattern: "widgets/*" },
        { type: "features", pattern: "features/*" },
        { type: "entities", pattern: "entities/*" },
        { type: "shared", pattern: "shared/*" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "app" } },
              allow: {
                to: {
                  element: {
                    type: ["views", "widgets", "features", "entities", "shared"],
                  },
                },
              },
            },
            {
              from: { element: { type: "views" } },
              allow: {
                to: {
                  element: { type: ["widgets", "features", "entities", "shared"] },
                },
              },
            },
            {
              from: { element: { type: "widgets" } },
              allow: {
                to: { element: { type: ["features", "entities", "shared"] } },
              },
            },
            {
              from: { element: { type: "features" } },
              allow: {
                to: { element: { type: ["entities", "shared"] } },
              },
            },
            {
              from: { element: { type: "entities" } },
              allow: {
                to: { element: { type: ["entities", "shared"] } },
              },
            },
            {
              from: { element: { type: "shared" } },
              allow: {
                to: { element: { type: "shared" } },
              },
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
