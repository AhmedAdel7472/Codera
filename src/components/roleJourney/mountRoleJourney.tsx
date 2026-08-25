import React from 'react';
import ReactDOM from 'react-dom/client';
import { RoleJourneyApp, RoleJourneyScreen } from './RoleJourneyApp';

let roleJourneyRootInstance: ReactDOM.Root | null = null;

export function openRoleJourney(screen: RoleJourneyScreen = 'main') {
  let container = document.getElementById('role-journey-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'role-journey-container';
    container.className = 'fixed inset-0 z-[300] overflow-y-auto bg-[#F6F3EE]';
    document.body.appendChild(container);
  }

  container.classList.remove('hidden');
  container.classList.add('active');
  document.body.classList.add('exam-mode');
  window.scrollTo(0, 0);

  if (!roleJourneyRootInstance) {
    roleJourneyRootInstance = ReactDOM.createRoot(container);
  }

  const handleClose = () => {
    if (container) {
      container.classList.add('hidden');
      container.classList.remove('active');
    }
    document.body.classList.remove('exam-mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  roleJourneyRootInstance.render(
    <React.StrictMode>
      <RoleJourneyApp initialScreen={screen} onClose={handleClose} />
    </React.StrictMode>
  );
}

export function closeRoleJourney() {
  const container = document.getElementById('role-journey-container');
  if (container) {
    container.classList.add('hidden');
    container.classList.remove('active');
  }
  document.body.classList.remove('exam-mode');
}

// Expose globally to window
(window as any).openRoleJourney = openRoleJourney;
(window as any).closeRoleJourney = closeRoleJourney;
(window as any).mountRoleJourney = openRoleJourney;
