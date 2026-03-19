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

// Vite asset imports
declare module "*.liquid?raw" {
  const content: string;
  export default content;
}

declare module "*.css?raw" {
  const content: string;
  export default content;
}
