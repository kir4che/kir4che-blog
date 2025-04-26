import { ImageResponse } from '@vercel/og';

import { CONFIG } from '@/config';

// @vercel/og 只支援在 Edge Runtime 上運行
export const runtime = 'edge';

const removeEmojis = (str: string) => {
  return str.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+|\uFE0F/g,
    ''
  );
};

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const title = removeEmojis(searchParams.get('title') || 'kir4che blog');
  const tags =
    searchParams
      .get('tags')
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean) || [];
  const url = 'kir4che.com';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px 100px',
          background: 'linear-gradient(135deg, #fff9f9, #ffecf0)',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 36,
            color: '#f77e9d',
            marginBottom: 24,
          }}
        >
          {CONFIG.siteInfo.blog.title}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            color: '#262626',
            lineHeight: 1.35,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 'auto',
            width: '100%',
            display: 'flex',
            justifyContent: tags.length > 0 ? 'space-between' : 'flex-end',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: tags.length > 0 ? 'flex' : 'none',
              gap: 12,
              flexWrap: 'wrap',
              fontSize: 24,
              color: '#f973a4',
            }}
          >
            {tags.length > 0 &&
              tags.map((tag, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    backgroundColor: '#ffe4ed',
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    letterSpacing: '1px',
                  }}
                >
                  # {tag}
                </div>
              ))}
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#ffb2c5' }}>
            {url}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
};
