import type { ReactNode } from 'react';

interface HeadingProps {
  id?: string;
  children?: ReactNode;
}

export const H1 = ({ id, children }: HeadingProps) => <h1 id={id}>{children}</h1>;
export const H2 = ({ id, children }: HeadingProps) => <h2 id={id}>{children}</h2>;
export const H3 = ({ id, children }: HeadingProps) => <h3 id={id}>{children}</h3>;
export const H4 = ({ id, children }: HeadingProps) => <h4 id={id}>{children}</h4>;
export const H5 = ({ id, children }: HeadingProps) => <h5 id={id}>{children}</h5>;
export const H6 = ({ id, children }: HeadingProps) => <h6 id={id}>{children}</h6>;
