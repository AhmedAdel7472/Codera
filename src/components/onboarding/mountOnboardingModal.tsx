import React from 'react';
import ReactDOM from 'react-dom/client';
import { CodeRaOnboardingModal } from './CodeRaOnboardingModal';
import { OnboardingSelection } from './types';

let modalRootInstance: ReactDOM.Root | null = null;

export function mountCodeRaOnboardingModal(
  onCompleteCallback?: (selection: OnboardingSelection) => void
) {
  let rootElement = document.getElementById('codera-onboarding-modal-root');
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = 'codera-onboarding-modal-root';
    document.body.appendChild(rootElement);
  }

  if (!modalRootInstance) {
    modalRootInstance = ReactDOM.createRoot(rootElement);
  }

  const handleClose = () => {
    if (modalRootInstance) {
      modalRootInstance.render(<React.Fragment />);
    }
  };

  const handleComplete = (selection: OnboardingSelection) => {
    console.log('CodeRa Onboarding Completed:', selection);
    // Store in localStorage for dashboard filtering
    try {
      localStorage.setItem('codera_onboarding_selection', JSON.stringify(selection));
    } catch (e) {}

    if (onCompleteCallback) {
      onCompleteCallback(selection);
    }
  };

  modalRootInstance.render(
    <React.StrictMode>
      <CodeRaOnboardingModal
        isOpen={true}
        onClose={handleClose}
        onComplete={handleComplete}
      />
    </React.StrictMode>
  );
}

// Attach globally to window
(window as any).mountCodeRaOnboardingModal = mountCodeRaOnboardingModal;
(window as any).openCodeRaOnboardingModal = mountCodeRaOnboardingModal;
