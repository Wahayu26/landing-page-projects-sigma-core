type UploadedMedia = { filename?: string | null; url?: string | null };

// This CMS hosts Payload media on the same app. A local path lets next/image
// optimize uploads without opening remote access to localhost/private networks.
export function cmsMediaUrl(value?: number | UploadedMedia | null): string | null {
  if (!value || typeof value !== 'object') return null;
  if (value.filename) return `/api/media/file/${encodeURIComponent(value.filename)}`;
  return value.url || null;
}
