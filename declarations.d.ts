// Type declarations for packages that don't ship their own types
declare module "eslint-plugin-jsx-a11y";
declare module "pagedjs" {
  export class Previewer {
    preview(
      content: string,
      stylesheets: string[],
      container: HTMLElement,
    ): Promise<unknown>;
  }
}

// Vite asset imports — ?raw returns a default export; disable rule for ambient declarations
declare module "*.liquid?raw" {
  const content: string;
  // eslint-disable-next-line import-x/no-default-export
  export default content;
}

declare module "*.css?raw" {
  const content: string;
  // eslint-disable-next-line import-x/no-default-export
  export default content;
}
