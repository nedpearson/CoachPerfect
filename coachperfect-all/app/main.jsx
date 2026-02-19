import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CoachPerfectDash from './CoachPerfect_Dashboard.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CoachPerfectDash />
  </StrictMode>
);
