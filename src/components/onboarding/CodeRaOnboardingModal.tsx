import React, { useState } from 'react';
import {
  ScreenId,
  OnboardingSelection,
  RoleType,
  JourneyType,
  SpecificRoleType,
} from './types';
import { OnboardingCard } from './OnboardingCard';
import {
  CoderIllustration,
  CodeGuideIllustration,
  ProgrammerIllustration,
  TeacherIllustration,
  SchoolIllustration,
  SpecializedCenterIllustration,
} from './OnboardingIllustrations';
import { ArrowLeft, Rocket, Puzzle, Trophy, Users, User, Building2, CheckCircle2, X } from 'lucide-react';

export interface CodeRaOnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: (selection: OnboardingSelection) => void;
}

export const CodeRaOnboardingModal: React.FC<CodeRaOnboardingModalProps> = ({
  isOpen = true,
  onClose,
  onComplete,
}) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('SCREEN_1_MAIN_ROLE');
  const [historyStack, setHistoryStack] = useState<ScreenId[]>([]);
  const [selection, setSelection] = useState<OnboardingSelection>({
    role: null,
    journeyType: null,
    specificRole: null,
  });

  if (!isOpen) return null;

  const navigateTo = (nextScreen: ScreenId) => {
    setHistoryStack((prev) => [...prev, currentScreen]);
    setCurrentScreen(nextScreen);
  };

  const handleBack = () => {
    if (historyStack.length === 0) {
      if (onClose) onClose();
      return;
    }
    const previousScreen = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setCurrentScreen(previousScreen);

    // Reset selection state relevant to current screen when stepping back
    if (currentScreen === 'SCREEN_2A_BUILDER' || currentScreen === 'SCREEN_2B_MENTOR_STEP1') {
      setSelection((prev) => ({ ...prev, role: null, journeyType: null }));
    } else if (
      currentScreen === 'SCREEN_3A_INDIVIDUAL_STEP2' ||
      currentScreen === 'SCREEN_3B_ORGANIZATION_STEP2'
    ) {
      setSelection((prev) => ({ ...prev, journeyType: null, specificRole: null }));
    }
  };

  const handleFinish = (finalSelection: OnboardingSelection) => {
    setSelection(finalSelection);
    setCurrentScreen('COMPLETED');
    if (onComplete) {
      onComplete(finalSelection);
    }
  };

  // Render top header step progress indicator
  const renderStepIndicator = () => {
    if (currentScreen === 'SCREEN_1_MAIN_ROLE' || currentScreen === 'COMPLETED') {
      return null;
    }

    if (currentScreen === 'SCREEN_2A_BUILDER') {
      // 1 of 1
      return (
        <div className="flex items-center gap-1.5" aria-label="Step 1 of 1">
          <span className="w-8 h-2.5 rounded-full bg-purple-600 shadow-sm transition-all"></span>
        </div>
      );
    }

    if (currentScreen === 'SCREEN_2B_MENTOR_STEP1') {
      // 1 of 2
      return (
        <div className="flex items-center gap-1.5" aria-label="Step 1 of 2">
          <span className="w-8 h-2.5 rounded-full bg-teal-600 shadow-sm transition-all"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 transition-all"></span>
        </div>
      );
    }

    if (currentScreen === 'SCREEN_3A_INDIVIDUAL_STEP2' || currentScreen === 'SCREEN_3B_ORGANIZATION_STEP2') {
      // 2 of 2
      const isPurple = currentScreen === 'SCREEN_3B_ORGANIZATION_STEP2';
      const activeColor = isPurple ? 'bg-purple-600' : 'bg-teal-600';

      return (
        <div className="flex items-center gap-1.5" aria-label="Step 2 of 2">
          <span className={`w-2.5 h-2.5 rounded-full ${activeColor} opacity-50 transition-all`}></span>
          <span className={`w-8 h-2.5 rounded-full ${activeColor} shadow-sm transition-all`}></span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#0B192C]/90 backdrop-blur-md overflow-y-auto font-sans text-slate-900 dark:text-slate-100">
      
      {/* Background Decorative Ambient Lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-[#0B192C] rounded-[2.5rem] p-2 sm:p-4 transition-all duration-300">
        
        {/* Screen 1 Layout vs Modal Card Layout */}
        {currentScreen === 'SCREEN_1_MAIN_ROLE' ? (
          <div className="flex flex-col min-h-[580px] justify-between p-4 sm:p-8">
            
            {/* Screen 1 Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-2xl font-black text-white">
                  <span className="text-purple-400 font-mono text-3xl">&lt;/&gt;</span>
                  <span className="tracking-tight">CodeRa</span>
                </div>
                <p className="text-slate-400 text-xs font-semibold tracking-wider mt-0.5 uppercase">
                  Code Today. Create Tomorrow.
                </p>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Screen 1 Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
              
              {/* Left Column: Heading & Mission Card */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                    What's your <br />
                    <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                      coding role?
                    </span>
                  </h1>
                  <p className="text-slate-300 text-base sm:text-lg mt-4 max-w-md font-medium leading-relaxed">
                    Choose your path and let's build a better future together.
                  </p>
                </div>

                {/* Banner Badge */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4 max-w-md">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                    <Puzzle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Different roles. One mission.
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      Building <span className="text-teal-300 font-bold">brighter futures</span> through code.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: BUILDER & MENTOR Option Cards */}
              <div className="lg:col-span-6 space-y-4">
                <OnboardingCard
                  id="BUILDER"
                  title="BUILDER"
                  subtitle="I want to learn, create & build."
                  accentColor="purple"
                  illustrationSvg={<CoderIllustration />}
                  layout="horizontal"
                  onClick={() => {
                    setSelection((prev) => ({ ...prev, role: 'BUILDER' }));
                    navigateTo('SCREEN_2A_BUILDER');
                  }}
                />

                <OnboardingCard
                  id="MENTOR"
                  title="MENTOR"
                  subtitle="I want to teach, inspire & empower."
                  accentColor="teal"
                  illustrationSvg={<CodeGuideIllustration />}
                  layout="horizontal"
                  onClick={() => {
                    setSelection((prev) => ({ ...prev, role: 'MENTOR' }));
                    navigateTo('SCREEN_2B_MENTOR_STEP1');
                  }}
                />
              </div>
            </div>

            {/* Screen 1 Footer Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 mt-6 border-t border-white/10 text-slate-300 text-xs">
              <div className="flex items-center gap-2.5">
                <Rocket className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Personalized Experience</div>
                  <div className="text-[11px] text-slate-400">We tailor everything to your goals.</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Puzzle className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Inclusive by Design</div>
                  <div className="text-[11px] text-slate-400">Empowering every ability.</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Real Skills, Real Impact</div>
                  <div className="text-[11px] text-slate-400">From learning to opportunities.</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Stronger Together</div>
                  <div className="text-[11px] text-slate-400">A community that supports you.</div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Step Modal Window Container */
          <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] shadow-2xl overflow-hidden flex flex-col min-h-[560px] animate-fadeIn border border-slate-100 dark:border-slate-800">
            
            {/* Modal Top Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
              
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Centered Brand Logo */}
              <div className="flex items-center gap-2 font-black text-xl text-slate-900 dark:text-white tracking-tight">
                <span className="text-purple-600 dark:text-purple-400 font-mono text-2xl">&lt;/&gt;</span>
                <span>CodeRa</span>
              </div>

              {/* Top-Right Step Indicators */}
              <div className="w-10 flex justify-end">
                {renderStepIndicator()}
              </div>
            </div>

            {/* Modal Body / Screens */}
            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center max-w-3xl mx-auto w-full">
              
              {/* SCREEN 2A: Builder Journey */}
              {currentScreen === 'SCREEN_2A_BUILDER' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Who's building with us?
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                      Tell us who you are so we can personalize your experience.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <OnboardingCard
                      id="CODER"
                      title="CODER"
                      subtitle="I'm here to learn, create & build."
                      accentColor="purple"
                      illustrationSvg={<CoderIllustration />}
                      onClick={() =>
                        handleFinish({ ...selection, journeyType: 'CODER' })
                      }
                    />

                    <OnboardingCard
                      id="CODE_GUIDE"
                      title="CODE GUIDE"
                      subtitle="I'm here to support, track & empower."
                      accentColor="teal"
                      illustrationSvg={<CodeGuideIllustration />}
                      onClick={() =>
                        handleFinish({ ...selection, journeyType: 'CODE_GUIDE' })
                      }
                    />
                  </div>
                </div>
              )}

              {/* SCREEN 2B: Mentor Journey (Step 1) */}
              {currentScreen === 'SCREEN_2B_MENTOR_STEP1' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      How are you joining <span className="text-teal-600 dark:text-teal-400">CodeRa?</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                      Choose your journey so we can serve you better.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
                    <OnboardingCard
                      id="INDIVIDUAL"
                      title="INDIVIDUAL"
                      subtitle="My personal journey"
                      accentColor="teal"
                      icon={<User className="w-8 h-8 stroke-[2]" />}
                      onClick={() => {
                        setSelection((prev) => ({ ...prev, journeyType: 'INDIVIDUAL' }));
                        navigateTo('SCREEN_3A_INDIVIDUAL_STEP2');
                      }}
                    />

                    <OnboardingCard
                      id="ORGANIZATION"
                      title="ORGANIZATION"
                      subtitle="Our organization's journey"
                      accentColor="purple"
                      icon={<Building2 className="w-8 h-8 stroke-[2]" />}
                      onClick={() => {
                        setSelection((prev) => ({ ...prev, journeyType: 'ORGANIZATION' }));
                        navigateTo('SCREEN_3B_ORGANIZATION_STEP2');
                      }}
                    />
                  </div>
                </div>
              )}

              {/* SCREEN 3A: Individual Journey (Step 2) */}
              {currentScreen === 'SCREEN_3A_INDIVIDUAL_STEP2' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      What brings you to <span className="text-purple-600 dark:text-purple-400">CodeRa?</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                      Tell us more about you.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <OnboardingCard
                      id="PROGRAMMER"
                      title="PROGRAMMER"
                      subtitle="I'm a programmer and I want to learn how to code for inclusion."
                      accentColor="purple"
                      illustrationSvg={<ProgrammerIllustration />}
                      onClick={() =>
                        handleFinish({ ...selection, specificRole: 'PROGRAMMER' })
                      }
                    />

                    <OnboardingCard
                      id="SPECIAL_EDUCATION_TEACHER"
                      title="SPECIAL EDUCATION TEACHER"
                      subtitle="I work with learners with special needs and want to learn coding."
                      accentColor="teal"
                      illustrationSvg={<TeacherIllustration />}
                      onClick={() =>
                        handleFinish({ ...selection, specificRole: 'SPECIAL_EDUCATION_TEACHER' })
                      }
                    />
                  </div>
                </div>
              )}

              {/* SCREEN 3B: Organization Journey (Step 2) */}
              {currentScreen === 'SCREEN_3B_ORGANIZATION_STEP2' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      What does your <span className="text-teal-600 dark:text-teal-400">organization</span> do?
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                      Tell us more about your organization.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <OnboardingCard
                      id="SCHOOL"
                      title="SCHOOL"
                      subtitle="We want to bring inclusive coding to our students."
                      accentColor="teal"
                      illustrationSvg={<SchoolIllustration />}
                      onClick={() =>
                        handleFinish({ ...selection, specificRole: 'SCHOOL' })
                      }
                    />

                    <OnboardingCard
                      id="SPECIALIZED_CENTER"
                      title="SPECIALIZED CENTER"
                      subtitle="We support learners with special educational needs."
                      accentColor="purple"
                      illustrationSvg={<SpecializedCenterIllustration />}
                      onClick={() =>
                        handleFinish({ ...selection, specificRole: 'SPECIALIZED_CENTER' })
                      }
                    />
                  </div>
                </div>
              )}

              {/* SCREEN COMPLETED */}
              {currentScreen === 'COMPLETED' && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Welcome to CodeRa!
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-base mt-2 max-w-md mx-auto">
                    Your profile options have been registered successfully.
                  </p>

                  <div className="my-8 p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl max-w-md mx-auto text-left border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Selected Options Summary
                    </div>

                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-500">Role:</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">{selection.role}</span>
                    </div>

                    {selection.journeyType && (
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-500">Journey Type:</span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">{selection.journeyType}</span>
                      </div>
                    )}

                    {selection.specificRole && (
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-500">Specific Path:</span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold">{selection.specificRole}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  >
                    Continue to Dashboard →
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            {currentScreen !== 'COMPLETED' && (
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {currentScreen === 'SCREEN_2A_BUILDER' && 'Builder Journey'}
                  {currentScreen === 'SCREEN_2B_MENTOR_STEP1' && 'Mentor Journey (Step 1)'}
                  {currentScreen === 'SCREEN_3A_INDIVIDUAL_STEP2' && 'Individual Journey (Step 2)'}
                  {currentScreen === 'SCREEN_3B_ORGANIZATION_STEP2' && 'Organization Journey (Step 2)'}
                </span>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
