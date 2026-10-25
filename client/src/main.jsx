import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { FeedbackProvider } from './components/shared/Feedback.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <FeedbackProvider>
        <App />
      </FeedbackProvider>
    </Provider>
  </StrictMode>
);