import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './context/ThemeContext';
import { VideoProvider } from './context/VideoContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <VideoProvider>
    <ThemeProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </ThemeProvider>
  </VideoProvider>
);
