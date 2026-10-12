/// <reference types="astro/client" />

declare module '*.css' {}

declare module '*.css?url' {
  const href: string;
  export default href;
}

declare module '*.ttf?inline' {
  const dataUrl: string;
  export default dataUrl;
}
