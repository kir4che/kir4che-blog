import { ImageResponse } from '@vercel/og';

import { CONFIG, LANGUAGES, DEFAULT_LANGUAGE } from '@/config';

const getLocalizedValue = (map: Record<string, string>, lang: string) =>
  map[lang] ?? map[DEFAULT_LANGUAGE];

const isSupportedLanguage = (
  value: string | null
): value is (typeof LANGUAGES)[number] =>
  value !== null && (LANGUAGES as readonly string[]).includes(value);

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
  const langParam = searchParams.get('lang');
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const defaultTitle = getLocalizedValue(CONFIG.siteInfo.blog.title, lang);
  const siteName = getLocalizedValue(CONFIG.siteInfo.blog.siteName, lang);
  const title = removeEmojis(searchParams.get('title') || defaultTitle);
  const tags =
    searchParams
      .get('tags')
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean) || [];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 80px',
        background: 'linear-gradient(135deg, #fff5f7, #ffe8f0, #ffd1e0)',
        fontFamily: 'GenSenRounded',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '250px',
          height: '250px',
          background: 'linear-gradient(45deg, #ffb3d1, #ff8fb8)',
          borderRadius: '50%',
          opacity: '0.3',
          boxShadow: '0 20px 40px rgba(255, 179, 209, 0.2)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(45deg, #ffd1dc, #ffaac9)',
          borderRadius: '50%',
          opacity: '0.25',
          boxShadow: '0 15px 30px rgba(255, 209, 220, 0.15)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '150px',
          left: '100px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, #ffe4ed, #ffcce0)',
          borderRadius: '50%',
          opacity: '0.4',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '200px',
          right: '120px',
          width: '40px',
          height: '40px',
          background: 'linear-gradient(45deg, #fff0f5, #ffe4f0)',
          borderRadius: '50%',
          opacity: '0.5',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: 40,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: '8px',
            height: '40px',
            background: 'linear-gradient(to bottom, #f77e9d, #ff6b9d)',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(247, 126, 157, 0.3)',
          }}
        />
        <div
          style={{
            fontSize: 40,
            color: '#e03d72',
            fontWeight: 'bold',
            textShadow: '3px 3px 6px rgba(233, 30, 99, 0.15)',
            letterSpacing: '1px',
          }}
        >
          {siteName}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: title.length > 20 ? 56 : 72,
          color: '#1a1a1a',
          lineHeight: 1.3,
          fontWeight: 'bold',
          maxWidth: '85%',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.08)',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 2,
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
          alignItems: 'flex-end',
          position: 'relative',
          zIndex: 2,
          gap: '20px',
        }}
      >
        <div
          style={{
            display: tags.length > 0 ? 'flex' : 'none',
            gap: 14,
            flexWrap: 'wrap',
            fontSize: 22,
            maxWidth: '60%',
          }}
        >
          {tags.length > 0 &&
            tags.map((tag, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #ffe8f3, #ffd4e8)',
                  color: '#d63384',
                  padding: '10px 24px',
                  borderRadius: '25px',
                  letterSpacing: '0.5px',
                  boxShadow:
                    '0 4px 12px rgba(214, 51, 132, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(214, 51, 132, 0.1)',
                  fontWeight: '600',
                }}
              >
                # {tag}
              </div>
            ))}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 30,
            color: '#8e1538',
            fontWeight: 'bold',
            padding: '12px 32px',
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 240, 245, 0.8))',
            borderRadius: '25px',
            boxShadow:
              '0 6px 20px rgba(142, 21, 56, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            border: '2px solid rgba(142, 21, 56, 0.1)',
            letterSpacing: '1px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#e03d72',
              marginRight: '12px',
              boxShadow: '0 0 8px rgba(233, 30, 99, 0.5)',
            }}
          />
          {CONFIG.siteInfo.name}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'GenSenRounded',
          data: await fetch(
            new URL('/fonts/GenSenRounded2TW-M.otf', req.url)
          ).then((res) => res.arrayBuffer()),
          weight: 500,
          style: 'normal',
        },
        {
          name: 'GenSenRounded',
          data: await fetch(
            new URL('/fonts/GenSenRounded2TW-B.otf', req.url)
          ).then((res) => res.arrayBuffer()),
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );
};
