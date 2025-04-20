export interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

const PLAYLIST_ID = process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID;
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

export const fetchYouTubeVideos = async (
  maxResults: number = 1
): Promise<VideoData[]> => {
  try {
    const res = await fetch(
      `${BASE_URL}?key=${API_KEY}&playlistId=${PLAYLIST_ID}&part=snippet&maxResults=${maxResults}`
    );
    if (!res.ok)
      throw new Error(`YouTube API request failed: ${res.statusText}`);

    const data = await res.json();
    if (!Array.isArray(data.items)) return [];

    return data.items
      .filter(
        (item: any) =>
          item?.snippet &&
          item.snippet.resourceId?.videoId &&
          item.snippet.thumbnails?.medium?.url
      )
      .map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
      }));
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Failed to fetch YouTube videos.'
    );
  }
};
