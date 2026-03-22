import type { Language } from '@/types';
import type { CSSProperties } from 'react';

export type OgImageProps = {
  siteName: string;
  title: string;
  tags: string[];
  lang: Language;
};

const MAX_TITLE_LENGTH = 80;

const containerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '60px 80px',
  background: 'linear-gradient(135deg, #fff5f7, #ffd1e0)',
  position: 'relative',
  overflow: 'hidden',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  marginBottom: 40,
  zIndex: 2,
};

const accentBarStyle: CSSProperties = {
  width: 8,
  height: 40,
  background: 'linear-gradient(to bottom, #f77e9d, #ff6b9d)',
  borderRadius: 4,
};

const siteNameStyle: CSSProperties = {
  fontSize: 40,
  color: '#e03d72',
  fontWeight: 'bold',
  letterSpacing: '1px',
};

const titleBaseStyle: CSSProperties = {
  display: 'flex',
  color: '#1a1a1a',
  lineHeight: 1.3,
  fontWeight: 'bold',
  maxWidth: '85%',
  marginBottom: 20,
  position: 'relative',
  zIndex: 2,
};

const footerStyle: CSSProperties = {
  marginTop: 'auto',
  width: '100%',
  display: 'flex',
  alignItems: 'flex-end',
  gap: 20,
  zIndex: 2,
};

const tagContainerStyle: CSSProperties = {
  display: 'flex',
  gap: 14,
  flexWrap: 'wrap',
  fontSize: 22,
  maxWidth: '60%',
};

const tagStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#fff0f5',
  color: '#d63384',
  padding: '10px 24px',
  borderRadius: 25,
  letterSpacing: '0.5px',
  border: '2px solid rgba(214, 51, 132, 0.5)',
  fontWeight: '600',
};

export function OgImage({ siteName, title, tags, lang }: OgImageProps) {
  const safeTitle =
    title.length > MAX_TITLE_LENGTH ? `${title.slice(0, MAX_TITLE_LENGTH - 1)}…` : title;

  const fontFamily =
    lang === 'tw'
      ? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  return (
    <div style={{ ...containerStyle, fontFamily }}>
      <div style={headerStyle}>
        <div style={accentBarStyle} />
        <div style={siteNameStyle}>{siteName}</div>
      </div>
      <div
        style={{
          ...titleBaseStyle,
          fontSize: safeTitle.length > 20 ? 64 : 80,
        }}
      >
        {safeTitle}
      </div>
      <div
        style={{
          ...footerStyle,
          justifyContent: tags.length > 0 ? 'space-between' : 'flex-end',
        }}
      >
        {tags.length > 0 && (
          <div style={tagContainerStyle}>
            {tags.map((tag) => (
              <div key={tag} style={tagStyle}>
                # {tag}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
