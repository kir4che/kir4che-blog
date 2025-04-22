import React from 'react';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type HeadingProps<T extends HeadingTag> = {
  as: T;
} & React.ComponentPropsWithRef<T>;

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps<HeadingTag>>(
  ({ as: Component, children, ...rest }, ref) => {
    return (
      <Component ref={ref} className='heading my-5 -ml-4 md:-ml-6' {...rest}>
        {children}
      </Component>
    );
  }
);
Heading.displayName = 'Heading';

const createHeading = <T extends HeadingTag>(tag: T) => {
  const Comp = React.forwardRef<
    HTMLHeadingElement,
    React.ComponentPropsWithRef<T>
  >((rest, ref) => <Heading as={tag} ref={ref} {...rest} />);
  Comp.displayName = `Custom${tag.toUpperCase()}`;
  return Comp;
};

export const H1 = createHeading('h1');
export const H2 = createHeading('h2');
export const H3 = createHeading('h3');
export const H4 = createHeading('h4');
export const H5 = createHeading('h5');
export const H6 = createHeading('h6');
