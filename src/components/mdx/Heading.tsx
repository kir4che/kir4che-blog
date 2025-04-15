import React from 'react';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type HeadingProps<T extends HeadingTag> = {
  as: T;
} & React.ComponentPropsWithRef<T>;

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps<HeadingTag>>(
  ({ as: Component, children, ...props }, ref) => {
    return (
      <Component ref={ref} className='heading my-5 -ml-4 md:-ml-6' {...props}>
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
  >((props, ref) => <Heading as={tag} ref={ref} {...props} />);
  Comp.displayName = `Custom${tag.toUpperCase()}`;
  return Comp;
};

export const CustomH1 = createHeading('h1');
export const CustomH2 = createHeading('h2');
export const CustomH3 = createHeading('h3');
export const CustomH4 = createHeading('h4');
export const CustomH5 = createHeading('h5');
export const CustomH6 = createHeading('h6');
