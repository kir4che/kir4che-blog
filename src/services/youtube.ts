export interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

const PLAYLIST_ID = process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID;
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

export const fetchYouTubeVideos = (
  maxResults: number = 1
): Promise<VideoData[]> => {
  return fetch(
    `${BASE_URL}?key=${API_KEY}&playlistId=${PLAYLIST_ID}&part=snippet&maxResults=${maxResults}`
  )
    .then((res) => {
      if (!res.ok) throw new Error('Fetch failed.');
      return res.json();
    })
    .then((data) => {
      if (!data.items?.length) return [];
      return data.items.map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
      }));
    })
    .catch(() => {
      throw new Error('Failed to fetch YouTube videos');
    });
};
