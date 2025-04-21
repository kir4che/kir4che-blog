import { ImageResponse } from '@vercel/og';
import common from '@/config/common';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'kir4che blog';
  const tagsParam = searchParams.get('tags') || '';
  const tags = tagsParam
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '80px 100px',
    background: 'linear-gradient(135deg, #fff9f9, #ffecf0)',
  };

  const titleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    fontSize: 36,
    fontWeight: 800,
    color: '#f77e9d',
    marginBottom: 24,
  };

  const mainTitleStyle: React.CSSProperties = {
    display: 'flex',
    fontSize: 72,
    fontWeight: 800,
    color: '#262626',
    lineHeight: 1.35,
    maxWidth: '1000px',
    wordWrap: 'break-word',
    marginBottom: 16,
  };

  const tagContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: 24,
  };

  const tagStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    fontSize: 24,
    fontWeight: 600,
    color: '#f973a4',
    backgroundColor: '#ffe4ed',
    padding: '6px 16px',
    borderRadius: '9999px',
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginTop: 'auto',
    fontSize: 26,
    color: '#ffb2c5',
    textAlign: 'right',
    alignSelf: 'flex-end',
    letterSpacing: '1px',
  };

  return new ImageResponse(
    (
      <div style={containerStyle}>
        <div style={titleStyle}>
          <span>{common.siteInfo.blog.title}</span>
        </div>
        <div style={mainTitleStyle}>
          <span>{title}</span>
        </div>
        {tags.length > 0 && (
          <div style={tagContainerStyle}>
            {tags.map((tag, index) => (
              <div key={index} style={tagStyle}>
                <span># {tag}</span>
              </div>
            ))}
          </div>
        )}
        <div style={footerStyle}>
          <span>kir4che.com</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
