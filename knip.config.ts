import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/main.tsx", "vite.config.ts", "e2e/**/*.ts"],
  project: ["src/**/*.{ts,tsx}", "e2e/**/*.ts"],
  ignore: [],
  ignoreDependencies: [
    // CLI tools — used via bunx, not imported in code
    "madge",
    "type-coverage",
    "rollup-plugin-visualizer",
    // Type-only packages — used implicitly by TypeScript
    "@types/dompurify",
    // Testing libraries — used via vitest globals, not direct imports
    "@testing-library/react",
    "@testing-library/user-event",
    // Peer dep of @tailwindcss/vite — not imported directly in code
    "tailwindcss",
  ],
  // Barrel re-exports are intentional public API surfaces between features
  ignoreExportsUsedInFile: true,
};

export default config;
