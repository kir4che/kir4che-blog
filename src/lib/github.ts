import type { Language } from '@/types';

import { fromBase64, toBase64 } from '@/utils/encoding';

const GITHUB_API_BASE = 'https://api.github.com';

let _config: { token: string; owner: string; repo: string; branch: string } | null = null;

const getConfig = () => {
  if (_config) return _config;

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH = 'main' } = import.meta.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO)
    throw new Error('缺少必要的 GitHub 環境變數: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');

  return (_config = {
    token: GITHUB_TOKEN,
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
  });
};

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
});

export const getGithubFilePath = (lang: Language, slug: string) =>
  `src/content/blog/${lang}/${slug}.mdx`;

const githubRequest = async (path: string, options: RequestInit = {}) => {
  const { token, owner, repo, branch } = getConfig();

  const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`);

  if (!options.method || options.method === 'GET') url.searchParams.set('ref', branch);

  const res = await fetch(url.toString(), {
    ...options,
    headers: { ...getHeaders(token), ...options.headers },
  });

  if (res.status === 404) return null;

  if (!res.ok) throw new Error(`GitHub ${options.method || 'GET'} 失敗 (${path}): ${res.status}`);

  return res;
};

// 讀取單一檔案
export const getGithubFile = async (filePath: string) => {
  const res = await githubRequest(filePath);
  if (!res) return null;

  const data = await res.json();

  return {
    ...data,
    content: fromBase64(data.content),
  };
};

export const listGithubDir = async (dirPath: string) => {
  const res = await githubRequest(dirPath);
  return res ? await res.json() : [];
};

// 新增或更新檔案
export const putGithubFile = async (
  filePath: string,
  content: string,
  message: string,
  sha?: string
) => {
  const { branch } = getConfig();

  await githubRequest(filePath, {
    method: 'PUT',
    body: JSON.stringify({ message, content: toBase64(content), branch, sha }),
  });
};

// 刪除檔案
export const deleteGithubFile = async (filePath: string, message: string, sha: string) => {
  const { branch } = getConfig();

  await githubRequest(filePath, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch }),
  });
};
