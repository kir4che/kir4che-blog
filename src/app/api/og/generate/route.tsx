import { ImageResponse } from '@vercel/og';

import common from '@/config/common';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { title = 'kir4che blog', tags = [] } = await req.json();

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
            fontSize: 36,
            fontWeight: 800,
            color: '#f77e9d',
            marginBottom: 24,
          }}
        >
          <span>{common.siteInfo.blog.title}</span>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#262626',
            lineHeight: 1.35,
          }}
        >
          <span>{title}</span>
        </div>
        {tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 24,
              flexWrap: 'wrap',
            }}
          >
            {tags.map((tag: string, i: number) => (
              <div
                key={i}
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#f973a4',
                  backgroundColor: '#ffe4ed',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                }}
              >
                #{tag}
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            marginTop: 'auto',
            fontSize: 26,
            color: '#ffb2c5',
            alignSelf: 'flex-end',
          }}
        >
          kir4che.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
