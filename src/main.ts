import './styles/app.css';
import { AssessmentRunner } from './components/AssessmentRunner';
import { renderCEODashboard, returnToLandingPage } from './components/ReportDashboard';
import { ParentRegistrationModal } from './components/ParentRegistrationModal';
import { renderParentDashboard } from './components/ParentDashboard';
import { mountCodeRaOnboardingModal } from './components/onboarding/mountOnboardingModal';
import { openRoleJourney, closeRoleJourney } from './components/roleJourney/mountRoleJourney';

export { mountCodeRaOnboardingModal, openRoleJourney, closeRoleJourney };

let currentRunner: AssessmentRunner | null = null;
let parentRegistrationModalInstance: ParentRegistrationModal | null = null;

export function openParentModal(stage: 1 | 2 = 1) {
  if (!parentRegistrationModalInstance) {
    parentRegistrationModalInstance = new ParentRegistrationModal((profile) => {
      startChildTest(false);
    });
  }
  parentRegistrationModalInstance.open(stage);
}

export function openParentDashboard() {
  const appContainer = document.getElementById('app');
  const childTestPage = document.getElementById('childTestPage');
  if (appContainer && childTestPage) {
    document.body.classList.add('exam-mode');
    childTestPage.classList.remove('hidden');
    childTestPage.classList.add('exam-active');
    childTestPage.scrollTop = 0;
    window.scrollTo(0, 0);
    renderParentDashboard(appContainer);
  }
}

export function startChildTest(restore: boolean = false) {
  const childTestPage = document.getElementById('childTestPage');
  if (childTestPage) {
    document.body.classList.add('exam-mode');
    childTestPage.classList.remove('hidden');
    childTestPage.classList.add('exam-active');
    window.scrollTo(0, 0);
  }

  let studentName = 'Alex Rivers';
  try {
    const parentProfile = localStorage.getItem('codera_parent_profile');
    if (parentProfile) {
      const parsed = JSON.parse(parentProfile);
      if (parsed.studentFullName && parsed.studentFullName.trim()) {
        studentName = parsed.studentFullName.trim();
      } else if (parsed.childName && parsed.childName.trim()) {
        studentName = parsed.childName.trim();
      }
    }
  } catch (err) {}

  initAssessment(studentName, restore);
}

export function initAssessment(studentName?: string, restoreIfAvailable: boolean = false) {
  let name = studentName;
  if (!name || name === 'Alex Rivers') {
    try {
      const parentProfile = localStorage.getItem('codera_parent_profile');
      if (parentProfile) {
        const parsed = JSON.parse(parentProfile);
        if (parsed.studentFullName && parsed.studentFullName.trim()) {
          name = parsed.studentFullName.trim();
        } else if (parsed.childName && parsed.childName.trim()) {
          name = parsed.childName.trim();
        }
      }
    } catch (e) {}
  }
  name = name || 'Alex Rivers';

  const appContainer = document.getElementById('app');
  if (appContainer) {
    if (!restoreIfAvailable) {
      AssessmentRunner.clearSavedSession();
    }
    currentRunner = new AssessmentRunner(appContainer);
    currentRunner.startSession(name, restoreIfAvailable);
  }
}

export function exitAssessment(reload: boolean = true) {
  AssessmentRunner.clearSavedSession();
  if (currentRunner) {
    currentRunner.exitAndReset(reload);
  } else {
    returnToLandingPage();
  }
}

export function openCEODashboard() {
  const appContainer = document.getElementById('app');
  const childTestPage = document.getElementById('childTestPage');
  if (appContainer && childTestPage) {
    document.body.classList.add('exam-mode');
    document.body.classList.add('ceo-view-mode');
    childTestPage.classList.remove('hidden');
    childTestPage.classList.add('exam-active');
    childTestPage.scrollTop = 0;
    window.scrollTo(0, 0);
    renderCEODashboard(appContainer);
  }
}

export function openParentPortal() {
  openParentDashboard();
}

export function openChildPortal() {
  startChildTest(false);
}

export function openProPortal() {
  openCEODashboard();
}

// Attach to window object for landing page scripts
(window as any).openParentModal = openParentModal;
(window as any).openParentModalModule = openParentModal;
(window as any).openParentDashboard = openParentDashboard;
(window as any).openParentDashboardModule = openParentDashboard;
(window as any).openParentPortal = openParentPortal;
(window as any).openChildPortal = openChildPortal;
(window as any).openProPortal = openProPortal;
(window as any).startChildTest = startChildTest;
(window as any).initAssessment = initAssessment;
(window as any).exitAssessment = exitAssessment;
(window as any).returnToLandingPage = returnToLandingPage;
(window as any).openCEODashboard = openCEODashboard;
(window as any).openCEODashboardModule = openCEODashboard;
(window as any).renderParentDashboard = renderParentDashboard;
(window as any).mountCodeRaOnboardingModal = mountCodeRaOnboardingModal;
(window as any).openCodeRaOnboardingModal = mountCodeRaOnboardingModal;
(window as any).openRoleJourney = openRoleJourney;
(window as any).closeRoleJourney = closeRoleJourney;
(window as any).openRoleJourneyModule = openRoleJourney;

export function openInstitutionModal(orgType: string = '') {
  const modalOverlay = document.getElementById('modalOverlay');
  const instModal = document.getElementById('institutionFormModal');
  const orgInput = document.getElementById('instOrgName') as HTMLInputElement;
  if (orgInput && orgType) {
    orgInput.placeholder = orgType === 'School' ? 'e.g. Modern Future International School' : 'e.g. Hope Specialized Care Center';
  }
  if (modalOverlay && instModal) {
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex', 'opacity-100');
    instModal.classList.remove('hidden');
    instModal.classList.remove('scale-95');
    instModal.classList.add('scale-100');
  }
}
(window as any).openInstitutionModal = openInstitutionModal;

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  const childTestPage = document.getElementById('childTestPage');

  const savedSession = AssessmentRunner.getSavedSession();

  if (savedSession && childTestPage) {
    // Session in progress was interrupted by refresh — restore automatically!
    document.body.classList.add('exam-mode');
    childTestPage.classList.remove('hidden');
    childTestPage.classList.add('exam-active');
    window.scrollTo(0, 0);
    initAssessment(savedSession.studentName || 'Alex Rivers', true);
  } else if (appContainer && !childTestPage) {
    // Auto-start in standalone runner mode
    initAssessment('Alex Rivers', false);
  }
});

