import TabbedPage from '../components/Layout/TabbedPage.jsx';
import AskIgris from './askIgris.jsx';
import RememberIgris from './rememberIgris.jsx';

const TABS = [
  { id: 'ask', label: 'Ask', hint: 'Chat with Igris about anything.', Component: AskIgris },
  { id: 'teach', label: 'Teach', hint: 'Upload files so Igris can remember them and answer from them.', Component: RememberIgris },
];

export default function AssistantPage() {
  return <TabbedPage label="assistant" tabs={TABS} />;
}
