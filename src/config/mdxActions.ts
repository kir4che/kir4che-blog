import type { MDXAction } from '@/types';

export const mdxActions: Record<string, MDXAction> = {
  bold: { before: '**', after: '**' },
  italic: { before: '*', after: '*' },
  inlineCode: { before: '`', after: '`' },
  codeBlock: { before: '``````\n' },
  list: { before: '- ' },
  orderedList: { before: '1. ' },
  link: { before: '[', after: '](url)\n' },
  mdImage: { before: '![', after: '](image-url)\n' },
  imageTag: {
    before: '<Image src="" alt="" title="" width="" height="" />\n',
    after: '',
  },
  blockquote: { before: '> ' },
  hr: { before: '---\n' },
  table: {
    before:
      '<Table data={{ headers: ["Header 1", "Header 2"], rows: [["Cell 1", "Cell 2"], ["Cell 3", "Cell 4"]] }} />\n',
    after: '',
  },
  accordion: {
    before: '<Accordion variant="primary" title="Title">\n',
    after: '\n</Accordion>\n',
  },
  highlight: { before: '<Highlight color="pink">', after: '</Highlight>\n' },
  correction: {
    before: '<Correction wrong="wrong text" correct="',
    after: '" />\n',
  },
  rating: { before: '<Rating type="star" rating={', after: '} />\n' },
  video: {
    before: '<Video src="video-url" title="Video title" />\n',
    after: '',
  },
  imageGallery: {
    before:
      '<Images images={[{ src: "image1.jpg", alt: "Alt text" }]} width="100%" height="auto" />\n',
    after: '',
  },
  keyboard: { before: '<Kbd>', after: '</Kbd>\n' },
} as const;

export type MDXActionKey = keyof typeof mdxActions;
