import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// C# Analogy: This is like the 'Program.cs' Main() method.
// It finds the HTML element with id 'root' and injects the React application into it.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  // StrictMode activates additional checks and warnings for descendants.
  // It effectively runs effects twice in dev mode to catch bugs.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);