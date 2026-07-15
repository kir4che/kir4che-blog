import { fields } from '@keystatic/core';
import { block, inline, wrapper, mark } from '@keystatic/core/content-components';
import { EyeOff, Keyboard, Link as LinkIcon, Text, Highlighter } from 'lucide-react';
import '@/styles/globals.css';

import { Image as MdxImage } from '../components/mdx/Image';
import { Table as MdxTable } from '../components/mdx/Table';
import { Images as MdxImages } from '../components/mdx/Images';
import { Accordion as MdxAccordion } from '../components/mdx/Accordion';
import { Alert as MdxAlert } from '../components/mdx/Alert';
import { Card as MdxCard } from '../components/mdx/Card';
import { Correction as MdxCorrection } from '../components/mdx/Correction';
import { Rating as MdxRating } from '../components/mdx/Rating';
import { Video as MdxVideo } from '../components/mdx/Video';
import { Badge as MdxBadge } from '../components/mdx/Badge';

export const mdxComponents = {
  Image: block({
    label: 'Image',
    schema: {
      src: fields.text({ label: 'URL', validation: { isRequired: true } }),
      alt: fields.text({ label: 'Alt' }),
      title: fields.text({ label: 'Title' }),
      width: fields.text({ label: 'Width', defaultValue: '100%' }),
      height: fields.text({ label: 'Height', defaultValue: '100%' }),
      align: fields.select({
        label: 'Alignment',
        options: [
          { label: 'Center', value: 'center' },
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'center',
      }),
      objPos: fields.select({
        label: 'Object Position',
        options: [
          { label: 'Center', value: 'center' },
          { label: 'Top', value: 'top' },
          { label: 'Bottom', value: 'bottom' },
        ],
        defaultValue: 'center',
      }),
      noLightbox: fields.checkbox({ label: 'No Lightbox', defaultValue: false }),
      className: fields.text({ label: 'Custom Class' }),
    },
    ContentView: (props) => {
      const { src, alt, title, width, height, align, objPos, noLightbox, className } = props.value;
      if (!src) {
        return (
          <div
            style={{
              padding: '16px',
              color: '#666',
              border: '1px dashed #ccc',
              textAlign: 'center',
            }}
          >
            No Image URL
          </div>
        );
      }
      return (
        <MdxImage
          src={src}
          alt={alt}
          title={title}
          width={width}
          height={height}
          align={align}
          objPos={objPos}
          noLightbox={noLightbox}
          className={className}
        />
      );
    },
  }),
  Alert: wrapper({
    label: 'Alert',
    schema: {
      type: fields.select({
        label: 'Type',
        options: [
          { label: 'Note', value: 'note' },
          { label: 'Tip', value: 'tip' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' },
        ],
        defaultValue: 'note',
      }),
      title: fields.text({ label: 'Title' }),
    },
    ContentView: (props) => {
      const { type, title } = props.value;
      return (
        <div className="keystatic-preview">
          <MdxAlert type={type} title={title}>
            {props.children}
          </MdxAlert>
        </div>
      );
    },
  }),
  Accordion: wrapper({
    label: 'Accordion',
    schema: {
      title: fields.text({ label: 'Title', validation: { isRequired: true } }),
      variant: fields.select({
        label: 'Variant',
        options: [
          { label: 'Default', value: 'default' },
          { label: 'Basic', value: 'basic' },
          { label: 'Pink', value: 'pink' },
        ],
        defaultValue: 'default',
      }),
    },
    ContentView: (props) => {
      const { title, variant } = props.value;
      return (
        <MdxAccordion title={title} variant={variant}>
          {props.children}
        </MdxAccordion>
      );
    },
  }),
  Video: block({
    label: 'Video',
    schema: {
      src: fields.text({ label: 'Source URL', validation: { isRequired: true } }),
      title: fields.text({ label: 'Title' }),
      width: fields.text({ label: 'Width', defaultValue: '100%' }),
      height: fields.text({ label: 'Height' }),
      align: fields.select({
        label: 'Alignment',
        options: [
          { label: 'Center', value: 'center' },
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'center',
      }),
      controls: fields.checkbox({ label: 'Show Controls', defaultValue: true }),
      autoPlay: fields.checkbox({ label: 'Auto Play', defaultValue: false }),
      loop: fields.checkbox({ label: 'Loop', defaultValue: false }),
      muted: fields.checkbox({ label: 'Muted', defaultValue: true }),
      poster: fields.text({ label: 'Poster URL' }),
    },
    ContentView: (props) => {
      const { src, title, width, height, align, controls, autoPlay, loop, muted, poster } =
        props.value;
      if (!src) {
        return (
          <div
            style={{
              padding: '16px',
              color: '#666',
              border: '1px dashed #ccc',
              textAlign: 'center',
            }}
          >
            No Video URL
          </div>
        );
      }
      return (
        <MdxVideo
          src={src}
          title={title}
          width={width}
          height={height}
          align={align}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          poster={poster}
        />
      );
    },
  }),
  Card: wrapper({
    label: 'Card',
    schema: {
      title: fields.text({ label: 'Title' }),
      subtitle: fields.text({ label: 'Subtitle' }),
      description: fields.text({ label: 'Description', multiline: true }),
    },
    ContentView: (props) => {
      const { title, subtitle, description } = props.value;
      return (
        <MdxCard title={title} subtitle={subtitle} description={description}>
          {props.children}
        </MdxCard>
      );
    },
  }),
  Badge: inline({
    label: 'Badge',
    schema: {
      text: fields.text({ label: 'Text', validation: { isRequired: true } }),
      color: fields.select({
        label: 'Color',
        options: [
          { label: 'Blue', value: 'blue' },
          { label: 'Red', value: 'red' },
          { label: 'Yellow', value: 'yellow' },
          { label: 'Orange', value: 'orange' },
          { label: 'Green', value: 'green' },
          { label: 'Purple', value: 'purple' },
          { label: 'Pink', value: 'pink' },
        ],
        defaultValue: 'blue',
      }),
    },
    ContentView: (props) => {
      const { text, color } = props.value;
      return <MdxBadge text={text || ''} color={color || 'blue'} />;
    },
  }),
  Rating: inline({
    label: 'Rating',
    schema: {
      rating: fields.number({ label: 'Rating', validation: { min: 0, max: 5 } }),
      type: fields.select({
        label: 'Icon Type',
        options: [
          { label: 'Star', value: 'star' },
          { label: 'Heart', value: 'heart' },
        ],
        defaultValue: 'star',
      }),
      size: fields.select({
        label: 'Size',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
        defaultValue: 'sm',
      }),
    },
    ContentView: (props) => {
      const { rating, type, size } = props.value;
      return <MdxRating rating={rating || 0} type={type || 'star'} size={size || 'sm'} />;
    },
  }),
  Spoiler: mark({
    label: 'Spoiler',
    icon: <EyeOff size={24} />,
    schema: {},
    tag: 'span',
    className:
      'bg-neutral-800 text-transparent hover:text-white transition-colors duration-200 cursor-pointer px-1 rounded',
  }),
  Kbd: mark({
    label: 'Kbd',
    icon: <Keyboard size={24} />,
    schema: {},
    tag: 'kbd',
    className:
      'px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600',
  }),
  Link: mark({
    label: 'Link',
    icon: <LinkIcon size={24} />,
    schema: {
      href: fields.text({ label: 'URL', validation: { isRequired: true } }),
      title: fields.text({ label: 'Title' }),
      external: fields.checkbox({ label: 'External Link', defaultValue: false }),
    },
    tag: 'a',
    className: 'text-pink-500 hover:text-pink-600 underline cursor-pointer',
  }),
  SmallText: mark({
    label: 'SmallText',
    icon: <Text size={24} />,
    schema: {},
    tag: 'small',
    className: 'text-xs text-gray-500 dark:text-gray-400',
  }),
  Correction: inline({
    label: 'Correction',
    schema: {
      wrong: fields.text({ label: 'Wrong Text', validation: { isRequired: true } }),
      correct: fields.text({ label: 'Correct Text', validation: { isRequired: true } }),
    },
    ContentView: (props) => {
      const { wrong, correct } = props.value;
      return <MdxCorrection wrong={wrong || ''} correct={correct || ''} />;
    },
  }),
  Highlight: mark({
    label: 'Highlight',
    icon: <Highlighter size={20} />,
    schema: {
      color: fields.select({
        label: 'Color',
        options: [
          { label: 'Yellow', value: 'yellow' },
          { label: 'Green', value: 'green' },
          { label: 'Pink', value: 'pink' },
          { label: 'Blue', value: 'blue' },
        ],
        defaultValue: 'pink',
      }),
    },
    tag: 'span',
    className: ({ value }) => {
      const colors: Record<string, string> = {
        yellow: 'bg-yellow-200 dark:bg-yellow-900/30 px-0.5 rounded',
        green: 'bg-green-200 dark:bg-green-900/30 px-0.5 rounded',
        pink: 'bg-pink-200 dark:bg-pink-900/30 px-0.5 rounded',
        blue: 'bg-blue-200 dark:bg-blue-900/30 px-0.5 rounded',
      };
      return colors[value.color || 'pink'] || colors.pink;
    },
  }),
  Table: block({
    label: 'Table',
    schema: {
      data: fields.object({
        headers: fields.array(fields.text({ label: 'Header' }), { label: 'Headers' }),
        rows: fields.array(fields.array(fields.text({ label: 'Cell' }), { label: 'Row' }), {
          label: 'Rows',
        }),
      }),
    },
    ContentView: (props) => {
      const { headers: readonlyHeaders = [], rows: readonlyRows = [] } = props.value.data || {};
      const headers = [...readonlyHeaders];
      const rows = readonlyRows.map((row) => [...row]);
      if (!headers.length && !rows.length) {
        return (
          <div
            style={{
              padding: '16px',
              color: '#666',
              border: '1px dashed #ccc',
              textAlign: 'center',
            }}
          >
            Empty Table
          </div>
        );
      }
      return <MdxTable data={{ headers, rows }} />;
    },
  }),
  Images: block({
    label: 'Images',
    schema: {
      title: fields.text({ label: 'Title' }),
      images: fields.array(
        fields.object({
          type: fields.select({
            label: 'Type',
            options: [
              { label: 'Image', value: 'image' },
              { label: 'Video', value: 'video' },
            ],
            defaultValue: 'image',
          }),
          src: fields.text({ label: 'URL', validation: { isRequired: true } }),
          alt: fields.text({ label: 'Alt' }),
          title: fields.text({ label: 'Title' }),
          width: fields.text({ label: 'Width' }),
          height: fields.text({ label: 'Height' }),
          colSpan: fields.number({ label: 'Col Span' }),
          className: fields.text({ label: 'Custom Class' }),
          objPos: fields.select({
            label: 'Object Position',
            options: [
              { label: 'Center', value: 'center' },
              { label: 'Top', value: 'top' },
              { label: 'Bottom', value: 'bottom' },
            ],
            defaultValue: 'center',
          }),
          autoPlay: fields.checkbox({ label: 'Auto Play', defaultValue: false }),
          loop: fields.checkbox({ label: 'Loop', defaultValue: false }),
          muted: fields.checkbox({ label: 'Muted', defaultValue: true }),
          controls: fields.checkbox({ label: 'Show Controls', defaultValue: true }),
          poster: fields.text({ label: 'Poster URL' }),
        }),
        {
          label: 'Media List',
          itemLabel: (item) =>
            `${item.fields.type.value === 'video' ? '📹' : '🖼️'} ${item.fields.src.value || 'No URL'}`,
        }
      ),
      width: fields.text({ label: 'Width', defaultValue: '85%' }),
      minWidth: fields.text({ label: 'Min Width', defaultValue: '150px' }),
      height: fields.text({ label: 'Height' }),
      minHeight: fields.text({ label: 'Min Height' }),
      maxHeight: fields.text({ label: 'Max Height' }),
      align: fields.select({
        label: 'Alignment',
        options: [
          { label: 'Center', value: 'center' },
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'center',
      }),
    },
    ContentView: (props) => {
      const { title, images, width, minWidth, height, minHeight, maxHeight, align } = props.value;
      const normalizedImages = (images || []).map((img) => ({
        type: img.type || 'image',
        src: img.src || '',
        alt: img.alt || undefined,
        title: img.title || undefined,
        width: img.width || undefined,
        height: img.height || undefined,
        colSpan: img.colSpan || undefined,
        className: img.className || undefined,
        objPos: img.objPos || undefined,
        autoPlay: img.autoPlay ?? undefined,
        loop: img.loop ?? undefined,
        muted: img.muted ?? undefined,
        controls: img.controls ?? undefined,
        poster: img.poster || undefined,
      }));
      if (!normalizedImages.length) {
        return (
          <div
            style={{
              padding: '16px',
              color: '#666',
              border: '1px dashed #ccc',
              textAlign: 'center',
            }}
          >
            Empty Gallery
          </div>
        );
      }
      return (
        <MdxImages
          images={normalizedImages}
          title={title}
          width={width}
          minWidth={minWidth}
          height={height}
          minHeight={minHeight}
          maxHeight={maxHeight}
          align={align}
        />
      );
    },
  }),
  Iframe: block({
    label: 'Iframe 嵌入',
    schema: {
      src: fields.text({ label: '嵌入網址 (URL)', validation: { isRequired: true } }),
      height: fields.number({ label: '高度 (px)', defaultValue: 400 }),
      title: fields.text({ label: '標題 (Title)', defaultValue: 'Iframe Embed' }),
    },
    ContentView: (props) => {
      const { src, height, title } = props.value;
      if (!src) {
        return (
          <div style={{ padding: '16px', border: '1px dashed #ccc', textAlign: 'center' }}>
            請輸入 Iframe 網址
          </div>
        );
      }
      return (
        <div
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}
        >
          🌐 [Iframe 嵌入: {title}] - {src} ({height}px)
        </div>
      );
    },
  }),
};
