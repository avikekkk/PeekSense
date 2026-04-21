import Image from 'next/image';
import Link from 'next/link';
import { ALBUMS } from '../albums.config';
import { getAlbumPreviews } from './lib/gallery-data';

export default async function AlbumsPage() {
  const albumData = await Promise.all(
    ALBUMS.map(async (album) => ({
      album,
      previews: await getAlbumPreviews(album),
    })),
  );

  return (
    <div className="albums">
      <header className="albums__header">
        <h1 className="albums__title">PeekSense</h1>
      </header>
      <nav className="albums__grid" aria-label="Albums">
        {albumData.map(({ album, previews }) => (
          <Link key={album.id} href={`/album/${album.id}`} className="albums__card">
            <div className="albums__stack">
              {previews.slice(0, 4).map((item, i) => (
                <div
                  key={item.id}
                  className="albums__stack-photo"
                  style={{ zIndex: 10 - i }}
                >
                  <Image
                    src={item.image}
                    alt={item.caption}
                    fill
                    sizes="(min-width: 40em) 20vw, 30vw"
                  />
                </div>
              ))}
              {previews.length === 0 && (
                <div className="albums__stack-empty">No photos yet</div>
              )}
            </div>
            <div className="albums__card-info">
              <span className="albums__card-name">{album.name}</span>
              <span className="albums__card-meta">
                {previews.length > 0 ? `${previews.length}+ photos` : 'Empty album'}
              </span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
