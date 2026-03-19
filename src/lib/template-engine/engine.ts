import { Liquid } from "liquidjs";

import type { ThemeDefinition } from "@/lib/types";

/**
 * Creates a LiquidJS engine configured for a specific theme.
 * The custom fs adapter resolves template names from the theme's templates record.
 */
export function createLiquidEngine(theme: ThemeDefinition): Liquid {
  const templates = theme.templates;

  function resolveTemplate(file: string): string | undefined {
    if (file in templates) return templates[file];
    if ("_default" in templates) {
      console.warn(
        `[cv-genius] Template partial "${file}" not found, using _default fallback.`,
      );
      return templates["_default"];
    }
    return undefined;
  }

  return new Liquid({
    cache: true,
    strictFilters: true,
    strictVariables: false,
    lenientIf: true,
    relativeReference: false,
    globals: {},
    fs: {
      readFileSync(file: string): string {
        const content = resolveTemplate(file);
        if (content === undefined) {
          throw new Error(`Template not found: ${file}`);
        }
        return content;
      },
      async readFile(file: string): Promise<string> {
        return this.readFileSync(file);
      },
      existsSync(file: string): boolean {
        return file in templates || "_default" in templates;
      },
      async exists(file: string): Promise<boolean> {
        return this.existsSync(file);
      },
      resolve(_root: string, file: string): string {
        return file;
      },
    },
  });
}
