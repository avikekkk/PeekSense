import { ElasticGrid } from './components/ElasticGrid';
import { gallery } from './lib/gallery-data';

export default function Home() {
  return <ElasticGrid gallery={gallery} />;
}
