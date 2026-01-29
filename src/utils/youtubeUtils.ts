/**
 * Utility functions for handling YouTube URLs and video IDs
 */

// Default EduFlow intro video ID - single source of truth
export const EDUFLOW_INTRO_VIDEO_ID = 'JUJ-AqucUlY';
export const EDUFLOW_INTRO_VIDEO_URL = 'https://youtu.be/JUJ-AqucUlY';

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Generates YouTube embed URL from video ID
 * Includes parameters: rel=0 (no related videos), modestbranding=1 (minimal YouTube branding)
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/**
 * Generates YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Validates if a string is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return /^https:\/\/(www\.)?youtube\.com\/watch\?v=|^https:\/\/youtu\.be\//.test(url);
}
