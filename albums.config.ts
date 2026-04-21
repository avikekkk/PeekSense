export interface AlbumConfig {
  /** URL-safe identifier used in /album/[id] routes. */
  readonly id: string;
  /** Display name shown in the album picker and gallery header. */
  readonly name: string;
  /** Name of the env var that holds this album's UploadThing token. */
  readonly tokenEnvKey: string;
}

/**
 * Add one entry per UploadThing app / album.
 * Each app's token goes in the corresponding env var (see .env.example).
 */
export const ALBUMS: readonly AlbumConfig[] = [
  {
    id: 'album-1',
    name: 'Album 1',
    tokenEnvKey: 'UPLOADTHING_TOKEN_1',
  },
  {
    id: 'album-2',
    name: 'Album 2',
    tokenEnvKey: 'UPLOADTHING_TOKEN_2',
  },
];
