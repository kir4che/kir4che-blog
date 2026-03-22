/// <reference types="astro/client" />

declare module '*.astro' {
  const Component: any;
  export default Component;
}

declare module 'mdx/types' {
  export type MDXComponents = Record<string, import('react').ComponentType<any>>;

  export interface MDXContentProps {
    children?: import('react').ReactNode;
    components?: MDXComponents;
  }
}
