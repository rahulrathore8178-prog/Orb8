import TabbedPage from '../components/Layout/TabbedPage.jsx';
import SearchPage from './SearchPage.jsx';
import DiscoverPage from './discoverPage.jsx';
import CosmicDiscoveryPage from './CosmicDiscoveryPage.jsx';

const TABS = [
  { id: 'search', label: 'Search', hint: 'Find people and Orbitals by name.', Component: SearchPage },
  { id: 'nearby', label: 'Nearby', hint: 'See people around you who chose to share their location.', Component: DiscoverPage },
  { id: 'cosmic', label: 'Cosmic', hint: 'Discover people, ideas and communities beyond your circle.', Component: CosmicDiscoveryPage },
];

export default function ExplorePage() {
  return <TabbedPage label="explore" tabs={TABS} />;
}
