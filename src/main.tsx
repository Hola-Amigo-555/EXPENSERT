
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure we're using the correct DOM element and handling errors
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Failed to find the root element");
  document.body.innerHTML = '<div>Error loading application. Please refresh the page.</div>';
} else {
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("React application successfully mounted");
}
