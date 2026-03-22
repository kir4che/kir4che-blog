const GITHUB_API_BASE = 'https://api.github.com';

const getConfig = () => {
  const token = import.meta.env.GITHUB_TOKEN;
  const owner = import.meta.env.GITHUB_OWNER;
  const repo = import.meta.env.GITHUB_REPO;
  const branch = import.meta.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo)
    throw new Error('缺少必要的 GitHub 環境變數: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');

  return { token, owner, repo, branch };
};

const githubHeaders = (token: string) => ({
  Authorization: `token ${token}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
});

export interface GithubFile {
  name: string;
  path: string;
  sha: string;
  content: string;
}

export interface GithubDirEntry {
  name: string;
  path: string;
  sha: string;
  type: 'file' | 'dir';
}

// 解碼 GitHub 的 Base64 內容
const decodeBase64 = (encoded: string): string =>
  Buffer.from(encoded.replace(/\n/g, ''), 'base64').toString('utf-8');

// GET
export const getGithubFile = async (filePath: string): Promise<GithubFile | null> => {
  const { token, owner, repo, branch } = getConfig();
  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
    { headers: githubHeaders(token) }
  );

  if (res.status === 404) return null;

  if (!res.ok)
    throw new Error(`GitHub GET 請求失敗 (${filePath}): ${res.status} ${await res.text()}`);

  const data = await res.json();
  return {
    name: data.name,
    path: data.path,
    sha: data.sha,
    content: decodeBase64(data.content),
  };
};

// 取得目錄列表
export const listGithubDir = async (dirPath: string): Promise<GithubDirEntry[]> => {
  const { token, owner, repo, branch } = getConfig();
  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`,
    { headers: githubHeaders(token) }
  );

  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub LIST 請求失敗 (${dirPath}): ${res.status}`);

  return res.json();
};

// PUT
export const putGithubFile = async (
  filePath: string,
  content: string,
  commitMessage: string,
  sha?: string
): Promise<void> => {
  const { token, owner, repo, branch } = getConfig();

  const body: Record<string, unknown> = {
    message: commitMessage,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch,
  };

  if (sha) body.sha = sha;

  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: githubHeaders(token),
    body: JSON.stringify(body),
  });

  if (!res.ok)
    throw new Error(`GitHub PUT 請求失敗 (${filePath}): ${res.status} ${await res.text()}`);
};

// DELETE
export const deleteGithubFile = async (
  filePath: string,
  commitMessage: string,
  sha: string
): Promise<void> => {
  const { token, owner, repo, branch } = getConfig();

  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'DELETE',
    headers: githubHeaders(token),
    body: JSON.stringify({ message: commitMessage, sha, branch }),
  });

  if (!res.ok)
    throw new Error(`GitHub DELETE 請求失敗 (${filePath}): ${res.status} ${await res.text()}`);
};
