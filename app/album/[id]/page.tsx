import { notFound } from 'next/navigation';
import { ALBUMS } from '../../../albums.config';
import { ElasticGrid } from '../../components/ElasticGrid';
import { getGallery } from '../../lib/gallery-data';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AlbumPage({ params }: Props) {
  const { id } = await params;
  const album = ALBUMS.find((a) => a.id === id);
  if (!album) notFound();

  const gallery = await getGallery(album);
  return <ElasticGrid gallery={gallery} albumName={album.name} />;
}
