// Prefija rutas de assets de /public con el basePath del deploy (GitHub Pages
// sirve el sitio bajo /<repo>). NEXT_PUBLIC_BASE_PATH se inyecta en build time.
export const assetPath = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
