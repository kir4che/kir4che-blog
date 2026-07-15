import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/utils/cn';

interface Prop {
  name: string;
  type: string;
  required?: true;
  default?: string;
  desc?: string;
}

interface Item {
  label: string;
  desc?: string;
  props?: Prop[];
  template: string;
  wrap?: { before: string; after: string };
  multilinePrefix?: string;
}

const CURSOR = '{|}'; // 游標占位符

const items: Record<string, Item> = {
  bold: { label: '粗體 Bold', template: '**{|}**', wrap: { before: '**', after: '**' } },
  italic: { label: '斜體 Italic', template: '*{|}*', wrap: { before: '*', after: '*' } },
  strikethrough: {
    label: '刪除線 Strikethrough',
    template: '~~{|}~~',
    wrap: { before: '~~', after: '~~' },
  },
  underline: {
    label: '底線 Underline (remark-ins)',
    template: '++{|}++',
    wrap: { before: '++', after: '++' },
  },
  mark: { label: '螢光標記 Mark', template: '=={|}==', wrap: { before: '==', after: '==' } },
  code: { label: '行內程式碼', template: '`{|}`', wrap: { before: '`', after: '`' } },
  link: {
    label: '超連結',
    desc: '方括號為顯示文字，圓括號為 URL',
    template: '[{|}](url)',
  },
  blockquote: { label: '引用區塊', template: '> {|}', multilinePrefix: '> ' },
  ul: {
    label: '無序清單',
    desc: '項目符號',
    template: '- {|}',
    multilinePrefix: '- ',
  },
  ol: {
    label: '有序清單',
    desc: '數字編號',
    template: '1. {|}',
  },
  'code-block': {
    label: '程式碼區塊',
    desc: '可指定語言（js, ts, bash, css…）',
    template: '```js\n{|}\n```',
  },
  image: {
    label: 'Image',
    desc: '響應式圖片，支援標題與對齊',
    props: [
      { name: 'src', type: 'string', required: true, desc: '圖片路徑或 URL' },
      { name: 'alt', type: 'string', desc: '替代文字（無障礙）' },
      { name: 'title', type: 'string', desc: '說明文字（顯示於圖片下方）' },
      { name: 'width', type: 'string|number', desc: '容器寬度' },
      { name: 'height', type: 'string|number', desc: '圖片高度（auto 表示不限制）' },
      { name: 'align', type: "'left'|'center'|'right'", default: "'center'" },
      { name: 'objPos', type: "'top'|'center'|'bottom'", default: "'center'", desc: '裁切位置' },
      { name: 'sizes', type: 'string', desc: '自訂 sizes attribute（響應式提示）' },
      { name: 'noLightbox', type: 'boolean', default: 'false', desc: '停用點擊放大' },
    ],
    template: '<Image src="{|}" alt="" title="" />',
  },
  images: {
    label: 'Images',
    desc: '多圖橫排展示（圖片集）',
    props: [
      {
        name: 'images',
        type: 'MediaItem[]',
        required: true,
        desc: '每項含 type、src、alt，可加 colSpan',
      },
      { name: 'title', type: 'string', desc: '整組說明文字' },
      { name: 'width', type: 'string|number', default: "'85%'", desc: '容器最大寬度' },
      {
        name: 'minWidth',
        type: 'string|number',
        default: "'150px'",
        desc: '每張圖最小寬度（低於此值改單欄）',
      },
      { name: 'height', type: 'string|number', desc: '統一圖片高度' },
      { name: 'minHeight', type: 'string|number', default: "'200px'" },
      { name: 'maxHeight', type: 'string|number', default: "'400px'" },
      { name: 'align', type: "'left'|'center'|'right'", default: "'center'" },
    ],
    template:
      "<Images\n  images={[\n    { type: 'image', src: '{|}', alt: '' },\n    { type: 'image', src: '', alt: '' },\n  ]}\n  title=\"\"\n  align=\"center\"\n/>",
  },
  video: {
    label: 'Video',
    desc: '嵌入影片，支援自動播放與循環',
    props: [
      { name: 'src', type: 'string', required: true, desc: '影片路徑或 URL' },
      { name: 'title', type: 'string', desc: '說明文字' },
      { name: 'width', type: 'string|number', default: "'100%'" },
      { name: 'height', type: 'string|number' },
      { name: 'align', type: "'left'|'center'|'right'", default: "'center'" },
      { name: 'controls', type: 'boolean', default: 'true', desc: '顯示播放控制列' },
      { name: 'autoPlay', type: 'boolean', default: 'false', desc: '自動播放（需搭配 muted）' },
      { name: 'loop', type: 'boolean', default: 'false', desc: '循環播放' },
      { name: 'muted', type: 'boolean', default: 'true', desc: '靜音' },
      { name: 'poster', type: 'string', desc: '封面圖片 URL' },
    ],
    template: '<Video src="{|}" title="" controls />',
  },
  highlight: {
    label: 'Highlight',
    desc: '螢光筆效果，支援多種顏色',
    props: [
      {
        name: 'color',
        type: "'yellow'|'green'|'blue'|'pink'|'custom'",
        default: "'pink'",
        desc: '螢光顏色',
      },
    ],
    template: '<Highlight color="pink">{|}</Highlight>',
    wrap: { before: '<Highlight color="pink">', after: '</Highlight>' },
  },
  kbd: {
    label: 'Kbd',
    desc: '鍵盤按鍵樣式',
    template: '<Kbd>{|}</Kbd>',
    wrap: { before: '<Kbd>', after: '</Kbd>' },
  },
  'small-text': {
    label: 'SmallText',
    desc: '小字文字段落',
    template: '<SmallText>{|}</SmallText>',
    wrap: { before: '<SmallText>', after: '</SmallText>' },
  },
  spoiler: {
    label: 'Spoiler',
    desc: '模糊遮蔽文字，滑鼠移過才顯示。',
    template: '<Spoiler>{|}</Spoiler>',
    wrap: { before: '<Spoiler>', after: '</Spoiler>' },
  },
  correction: {
    label: 'Correction',
    desc: '隱藏錯誤文字，並顯示正確文字',
    props: [
      { name: 'wrong', type: 'string', required: true, desc: '錯誤文字（點擊可展開查看）' },
      { name: 'correct', type: 'string', required: true, desc: '正確文字' },
    ],
    template: '<Correction wrong="{|}" correct="" />',
  },
  accordion: {
    label: 'Accordion',
    desc: '可折疊的手風琴區塊',
    props: [
      { name: 'title', type: 'string', required: true, desc: '顯示標題' },
      {
        name: 'variant',
        type: "'default'|'basic'|'pink'",
        default: "'default'",
        desc: '外觀樣式',
      },
    ],
    template: '<Accordion title="{|}" variant="default">\n  內容文字\n</Accordion>',
  },
  table: {
    label: 'Table',
    desc: '自訂樣式表格，支援 `inline code` 與相鄰儲存格自動合併',
    props: [
      { name: 'data.headers', type: 'string[]', required: true, desc: '欄位標題' },
      {
        name: 'data.rows',
        type: '(string|undefined)[][]',
        required: true,
        desc: '表格內容（相同值自動 colspan 合併）',
      },
    ],
    template:
      "<Table\n  data={{\n    headers: ['{|}', '欄位二', '欄位三'],\n    rows: [\n      ['資料一', '資料二', '資料三'],\n      ['資料四', '資料五', '資料六'],\n    ],\n  }}\n/>",
  },
  rating: {
    label: 'Rating',
    desc: '星形或愛心評分，0.5 步進',
    props: [
      { name: 'type', type: "'star'|'heart'", default: "'star'", desc: '評分圖示' },
      { name: 'rating', type: 'number (0.5~5.0)', required: true, desc: '評分值' },
      { name: 'size', type: "'sm'|'md'|'lg'", default: "'sm'" },
    ],
    template: '<Rating type="star" rating={4.5} size="sm" />',
  },
};

// 防止在 tooltip 中直接顯示 HTML tag
const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 產生 tooltip 的 HTML 內容
const renderTooltipHtml = (item: Item): string => {
  const exampleCode = escapeHtml(item.template.replaceAll(CURSOR, ''));
  const propsHtml = item.props
    ? `<div class="tt-props">${item.props
        .map(
          (p) =>
            `<div class="tt-prop-row">` +
            `<span class="tt-pname">${p.name}${p.required ? '<span class="tt-req">*</span>' : ''}</span>` +
            `<span><span class="tt-pinfo">${p.type}</span>${p.default ? `<span class="tt-pdefault">= ${p.default}</span>` : ''}${p.desc ? `<span class="tt-pdefault"> — ${p.desc}</span>` : ''}</span>` +
            `</div>`
        )
        .join('')}</div>`
    : '';

  return (
    `<div class="tt-head"><div class="tt-name">${item.label}</div>${item.desc ? `<div class="tt-desc">${item.desc}</div>` : ''}</div>` +
    propsHtml +
    `<pre class="tt-code">${exampleCode}</pre>`
  );
};

const tooltipCache = new Map(Object.values(items).map((item) => [item, renderTooltipHtml(item)]));

interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  enablePreviewSync?: boolean;
  onPreviewSyncChange?: (enabled: boolean) => void;
}

const BUTTONS: { id: string; label: string; className?: string }[] = [
  { id: 'bold', label: 'B', className: 'font-bold' },
  { id: 'italic', label: 'I', className: 'italic' },
  { id: 'strikethrough', label: 'S', className: 'line-through' },
  { id: 'underline', label: 'U', className: 'underline' },
  { id: 'mark', label: 'M', className: 'bg-yellow-300/30 text-yellow-200' },
  { id: 'code', label: 'code', className: 'font-mono text-[10px]' },
  { id: 'link', label: '[…]' },
  { id: 'blockquote', label: '❝' },
  { id: 'ul', label: '•', className: 'text-lg leading-none pt-0.5' },
  { id: 'ol', label: '1.', className: 'font-mono text-xs' },
  { id: 'code-block', label: '‹/›', className: 'font-mono' },
  { id: '__sep1', label: '' },
  { id: 'image', label: 'Image' },
  { id: 'images', label: 'Images' },
  { id: 'video', label: 'Video' },
  { id: '__sep2', label: '' },
  { id: 'highlight', label: 'Highlight' },
  { id: 'kbd', label: 'Kbd' },
  { id: 'small-text', label: 'SmallText' },
  { id: 'spoiler', label: 'Spoiler' },
  { id: 'correction', label: 'Correction' },
  { id: '__sep3', label: '' },
  { id: 'accordion', label: 'Accordion' },
  { id: 'table', label: 'Table' },
  { id: 'rating', label: 'Rating' },
];

const EditorToolbar = ({
  textareaRef,
  enablePreviewSync = false,
  onPreviewSyncChange,
}: EditorToolbarProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 插入 template 到 textarea
  const insertTemplate = useCallback(
    (item: Item) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const selStart = textarea.selectionStart ?? 0;
      const selEnd = textarea.selectionEnd ?? 0;
      const selectedText = textarea.value.substring(selStart, selEnd);

      let tpl = item.template;

      if (selectedText) {
        if (item.multilinePrefix) {
          // 將選取的文字依照換行符號拆解，並逐行加上前綴。
          const lines = selectedText.split('\n');
          tpl = lines
            .map((line, i) => {
              const prefix = item.multilinePrefix === '1. ' ? `${i + 1}. ` : item.multilinePrefix;
              return `${prefix}${line}`;
            })
            .join('\n');
        } else if (item.wrap) {
          // 單行文字則直接套用前後綴
          tpl = item.wrap.before + selectedText + item.wrap.after;
        }
      }

      const cursorIdx = tpl.indexOf(CURSOR);
      const cleanTpl = tpl.replaceAll(CURSOR, '');

      textarea.focus();
      textarea.setRangeText(cleanTpl, selStart, selEnd, 'end');

      const newPos = cursorIdx >= 0 ? selStart + cursorIdx : selStart + cleanTpl.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    },
    [textareaRef]
  );

  // 顯示 tooltip
  const showTooltip = useCallback((btn: HTMLElement, item: Item) => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    clearTimeout(hideTimerRef.current);

    tooltip.innerHTML = tooltipCache.get(item)!;
    tooltip.style.display = 'block';

    const rect = btn.getBoundingClientRect();
    const tipWidth = 280;
    let left = rect.left;
    if (left + tipWidth > window.innerWidth - 8) left = window.innerWidth - tipWidth - 8;
    if (left < 8) left = 8;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${rect.bottom + 4}px`;
  }, []);

  // 隱藏 tooltip
  const hideTooltip = useCallback(() => {
    hideTimerRef.current = setTimeout(() => {
      if (tooltipRef.current) tooltipRef.current.style.display = 'none';
    }, 120);
  }, []);

  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  // 根據按鈕 id 插入對應的 template
  const handleClick = useCallback(
    (tid: string) => {
      const item = items[tid];
      if (item) insertTemplate(item);
    },
    [insertTemplate]
  );

  // 處理滑鼠 hover 到按鈕上時執行 showTooltip
  const handleMouseOver = useCallback(
    (e: React.MouseEvent) => {
      const btn = (e.target as Element).closest<HTMLElement>('[data-tid]');
      if (!btn?.dataset.tid) return;
      const item = items[btn.dataset.tid];
      if (item) showTooltip(btn, item);
    },
    [showTooltip]
  );

  return (
    <>
      <div
        className="flex shrink-0 flex-wrap items-center gap-px bg-gray-900 px-2 py-1 select-none"
        onMouseOver={handleMouseOver}
        onMouseOut={hideTooltip}
      >
        {BUTTONS.map((btn) => {
          if (btn.id.startsWith('__sep'))
            return <div key={btn.id} className="mx-2 h-4 w-px shrink-0 bg-gray-600" />;

          return (
            <button
              key={btn.id}
              type="button"
              className={cn('tbtn', btn.className)}
              data-tid={btn.id}
              onClick={() => handleClick(btn.id)}
            >
              {btn.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 pl-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-300 hover:text-gray-200">
            <input
              type="checkbox"
              checked={enablePreviewSync}
              onChange={(e) => onPreviewSyncChange?.(e.target.checked)}
              className="checkbox checkbox-xs accent-primary bg-gray-700"
            />
            <span>同步預覽</span>
          </label>
        </div>
      </div>
      <div
        ref={tooltipRef}
        id="tb-tooltip"
        style={{ display: 'none', position: 'fixed', zIndex: 9999 }}
      />
    </>
  );
};

export default EditorToolbar;
