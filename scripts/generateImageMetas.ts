import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { getPlaiceholder } from 'plaiceholder';

const postsDirectory = path.join(__dirname, '../src/posts');
const outputPath = path.join(process.cwd(), 'public', 'imageMetas.json');

const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

async function getMediaMeta(src: string) {
  const mediaPath = path.join(process.cwd(), 'public', src);
  const fileExtension = path.extname(mediaPath).toLowerCase();

  if (validImageExtensions.includes(fileExtension)) {
    const buffer = await fs.readFile(mediaPath);
    const { base64 } = await getPlaiceholder(buffer);
    return {
      src: '/' + src.replace(/^\/+/, ''),
      blurDataURL: base64,
    };
  }

  return null;
}

const extractImageSrcs = (content: string): Set<string> => {
  const imageRegex =
    /!\[[^\]]*]\((\/[^)]+)\)|<(?:CustomImage|Image|img)[^>]*\s+src=["'](\/[^"']+)["']|src\s*[:=]\s*["'](\/[^"']+)["']/g;

  const srcs = new Set<string>();
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const src = match[1] || match[2] || match[3];
    if (src?.startsWith('/')) {
      srcs.add(src);
    }
  }

  return srcs;
};

async function main() {
  const slugs = await fs.readdir(postsDirectory);
  const allImageSrcs = new Set<string>();

  for (const slug of slugs) {
    const dir = path.join(postsDirectory, slug);
    const files = await fs.readdir(dir);
    const file = files.find((f) => f === 'index.mdx' || f === 'index.en.mdx');
    if (!file) continue;

    const content = await fs.readFile(path.join(dir, file), 'utf-8');
    const { content: mdxContent } = matter(content);
    const imageSrcs = extractImageSrcs(mdxContent);

    imageSrcs.forEach((src) => allImageSrcs.add(src));
  }

  const imageMetas: Record<string, any> = {};

  for (const src of allImageSrcs) {
    try {
      const meta = await getMediaMeta(src.slice(1)); // remove starting "/"
      if (meta) imageMetas[src] = meta;
    } catch (err) {
      console.error(`❌ Failed to generate meta for ${src}`, err);
    }
  }

  await fs.writeFile(outputPath, JSON.stringify(imageMetas, null, 2));
  console.log(`✅ Image metas generated at: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
