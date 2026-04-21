import { unstable_cache } from 'next/cache';
import { UTApi } from 'uploadthing/server';
import type { AlbumConfig } from '../../albums.config';

export interface GridItem {
  id: string;
  image: string;
  caption: string;
}

export interface GalleryConfig {
  items: GridItem[];
}

const MAX_DISPLAYED = 300;
const PAGE_SIZE = 500;
const CACHE_SECONDS = 60 * 60;

const getAppId = (token: string): string => {
  const decoded = Buffer.from(token, 'base64').toString('utf-8');
  const { appId } = JSON.parse(decoded) as { appId: string };
  return appId;
};

const cleanCaption = (name: string): string =>
  name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();

type UploadThingFile = Awaited<ReturnType<UTApi['listFiles']>>['files'][number];

const listAllFiles = async (utapi: UTApi, cap: number): Promise<UploadThingFile[]> => {
  const all: UploadThingFile[] = [];
  let offset = 0;

  while (all.length < cap) {
    const { files, hasMore } = await utapi.listFiles({ limit: PAGE_SIZE, offset });
    all.push(...files);
    if (!hasMore || files.length === 0) break;
    offset += files.length;
  }

  return all;
};

const fetchGallery = unstable_cache(
  async (albumId: string, tokenEnvKey: string): Promise<GalleryConfig> => {
    const token = process.env[tokenEnvKey];
    if (!token) {
      throw new Error(
        `${tokenEnvKey} is not set. Add it to .env.local (album: "${albumId}").`,
      );
    }

    const utapi = new UTApi({ token });
    const appId = getAppId(token);
    const files = await listAllFiles(utapi, MAX_DISPLAYED);

    const items: GridItem[] = files
      .filter((file) => file.status === 'Uploaded')
      .map((file) => ({
        id: file.key,
        image: `https://${appId}.ufs.sh/f/${file.key}`,
        caption: cleanCaption(file.name),
      }))
      .sort((a, b) =>
        a.caption.localeCompare(b.caption, undefined, { sensitivity: 'base', numeric: true }),
      )
      .slice(0, MAX_DISPLAYED);

    return { items };
  },
  ['uploadthing-gallery'],
  { revalidate: CACHE_SECONDS, tags: ['gallery'] },
);

export const getGallery = (album: AlbumConfig): Promise<GalleryConfig> =>
  fetchGallery(album.id, album.tokenEnvKey);

const PREVIEW_COUNT = 4;

const fetchPreviews = unstable_cache(
  async (albumId: string, tokenEnvKey: string): Promise<GridItem[]> => {
    const token = process.env[tokenEnvKey];
    if (!token) return [];

    const utapi = new UTApi({ token });
    const appId = getAppId(token);
    const { files } = await utapi.listFiles({ limit: PREVIEW_COUNT });

    return files
      .filter((file) => file.status === 'Uploaded')
      .slice(0, PREVIEW_COUNT)
      .map((file) => ({
        id: file.key,
        image: `https://${appId}.ufs.sh/f/${file.key}`,
        caption: cleanCaption(file.name),
      }));
  },
  ['uploadthing-previews'],
  { revalidate: CACHE_SECONDS, tags: ['gallery'] },
);

export const getAlbumPreviews = (album: AlbumConfig): Promise<GridItem[]> =>
  fetchPreviews(album.id, album.tokenEnvKey);
