import { ElasticGrid } from './components/ElasticGrid';
import { getGallery } from './lib/gallery-data';

export default async function Home() {
  const gallery = await getGallery();
  return <ElasticGrid gallery={gallery} />;
}
