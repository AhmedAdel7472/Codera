import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Code2,
  User,
  Building2,
  Heart,
  GraduationCap,
  Rocket,
  Puzzle,
  Trophy,
  Users,
  CheckCircle2,
  Home,
  X,
  Sparkles,
  Gamepad2,
  Stethoscope
} from 'lucide-react';

export type RoleJourneyScreen =
  | 'main'
  | 'builder'
  | 'mentor'
  | 'individual'
  | 'organization';

const IMAGES = {
  builderRole: '/img/bilder.jpeg',
  mentorRole: '/img/monter.jpeg',
  coder: '/img/coder.jpeg',
  guide: '/img/guide.jpeg',
  programmer: '/img/coder.jpeg',
  teacher: '/img/guide.jpeg',
  school: '/img/school.jpeg',
  center: '/img/specialist Center.jpeg',
};

const FALLBACK_IMAGES = {
  builderRole: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  mentorRole: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80',
  coder: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  guide: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80',
  programmer: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  teacher: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
  school: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
  center: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
};

type FallbackKey = keyof typeof FALLBACK_IMAGES;

interface ImageWithFallbackProps {
  src: string;
  fallbackKey: FallbackKey;
  alt: string;
  className?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackKey,
  alt,
  className = '',
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError ? FALLBACK_IMAGES[fallbackKey] : imgSrc}
      alt={alt}
      className={className}
      onError={(event) => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(FALLBACK_IMAGES[fallbackKey]);
        } else {
          event.currentTarget.style.display = 'none';
        }
      }}
    />
  );
};

export interface RoleJourneyAppProps {
  initialScreen?: RoleJourneyScreen;
  onClose?: () => void;
}

export const RoleJourneyApp: React.FC<RoleJourneyAppProps> = ({
  initialScreen = 'main',
  onClose,
}) => {
  const [currentScreen, setCurrentScreen] = useState<RoleJourneyScreen>(initialScreen);
  const [history, setHistory] = useState<RoleJourneyScreen[]>([]);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setCurrentScreen(initialScreen);
    setHistory([]);
  }, [initialScreen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3500);
  };

  const navigate = (screen: RoleJourneyScreen) => {
    setHistory((previous) => [...previous, currentScreen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length === 0) {
      if (onClose) {
        onClose();
      } else {
        returnToLanding();
      }
      return;
    }
    const newHistory = [...history];
    const previous = newHistory.pop();
    setHistory(newHistory);
    if (previous) setCurrentScreen(previous);
  };

  const returnToLanding = () => {
    if (onClose) {
      onClose();
    }
    const roleContainer = document.getElementById('role-journey-container');
    if (roleContainer) {
      roleContainer.classList.add('hidden');
      roleContainer.classList.remove('active');
    }
    document.body.classList.remove('exam-mode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Connect to platform actions
  const handleSelectCoder = () => {
    try {
      localStorage.setItem('codera_user_role', JSON.stringify({ role: 'BUILDER', type: 'CODER' }));
    } catch (e) {}
    showToast('🚀 Launching Child Placement Assessment...');
    setTimeout(() => {
      returnToLanding();
      if (typeof (window as any).startChildTest === 'function') {
        (window as any).startChildTest(false);
      }
    }, 600);
  };

  const handleSelectCodeGuide = () => {
    try {
      localStorage.setItem('codera_user_role', JSON.stringify({ role: 'BUILDER', type: 'CODE_GUIDE' }));
    } catch (e) {}
    showToast('👨‍👩‍👧‍👦 Opening Parent Portal & Family Configuration...');
    setTimeout(() => {
      returnToLanding();
      if (typeof (window as any).openParentDashboard === 'function') {
        (window as any).openParentDashboard();
      } else if (typeof (window as any).openParentModal === 'function') {
        (window as any).openParentModal(1);
      }
    }, 600);
  };

  const handleSelectProgrammer = () => {
    try {
      localStorage.setItem('codera_user_role', JSON.stringify({ role: 'MENTOR', journey: 'INDIVIDUAL', type: 'PROGRAMMER' }));
    } catch (e) {}
    showToast('💻 Welcome Programmer! Exploring Inclusive Coding Tracks...');
    setTimeout(() => {
      returnToLanding();
      const tracksSection = document.getElementById('tracks-section') || document.getElementById('pyramid-container');
      if (tracksSection) {
        tracksSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 800);
  };

  const handleSelectSpecialEdTeacher = () => {
    try {
      localStorage.setItem('codera_user_role', JSON.stringify({ role: 'MENTOR', journey: 'INDIVIDUAL', type: 'SPECIAL_ED_TEACHER' }));
    } catch (e) {}
    showToast('🩺 Opening Pro Specialist & Assessor Dashboard...');
    setTimeout(() => {
      returnToLanding();
      if (typeof (window as any).openCEODashboard === 'function') {
        (window as any).openCEODashboard();
      }
    }, 600);
  };

  const handleSelectSchool = () => {
    try {
      localStorage.setItem('codera_user_role', JSON.stringify({ role: 'MENTOR', journey: 'ORGANIZATION', type: 'SCHOOL' }));
    } catch (e) {}
    showToast('🏫 Opening School & Institutional Partnership Form...');
    setTimeout(() => {
      returnToLanding();
      if (typeof (window as any).openInstitutionModal === 'function') {
        (window as any).openInstitutionModal('School');
      } else {
        const modalOverlay = document.getElementById('modalOverlay');
        const instModal = document.getElementById('institutionFormModal');
        if (modalOverlay && instModal) {
          modalOverlay.classList.remove('hidden');
          modalOverlay.classList.add('flex', 'opacity-100');
          instModal.classList.remove('hidden');
        }
      }
    }, 600);
  };

  const handleSelectSpecializedCenter = () => {
    try {
      localStorage.setItem('codera_user_role', JSON.stringify({ role: 'MENTOR', journey: 'ORGANIZATION', type: 'SPECIALIZED_CENTER' }));
    } catch (e) {}
    showToast('🏥 Opening Specialized Center Partnership Form...');
    setTimeout(() => {
      returnToLanding();
      if (typeof (window as any).openInstitutionModal === 'function') {
        (window as any).openInstitutionModal('Specialized Center');
      } else {
        const modalOverlay = document.getElementById('modalOverlay');
        const instModal = document.getElementById('institutionFormModal');
        if (modalOverlay && instModal) {
          modalOverlay.classList.remove('hidden');
          modalOverlay.classList.add('flex', 'opacity-100');
          instModal.classList.remove('hidden');
        }
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full selection:bg-teal-500/30 font-sans relative bg-[#F6F3EE] text-[#172238]">
      {/* Top Floating Quick Navigation Bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E8E1D8] shadow-lg">
        <button
          onClick={returnToLanding}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#172238] hover:text-[#6366F1] transition-colors rounded-full hover:bg-slate-100"
          title="Return to Main Landing Page"
        >
          <Home size={15} />
          <span>Home / الرئيسية</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
            title="Close"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-medium shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 bg-[#0D9488] text-white ${
          toastMsg ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <CheckCircle2 size={20} />
        <span>{toastMsg}</span>
      </div>

      {/* Active Screen Router */}
      {currentScreen === 'main' && (
        <MainPage onNavigate={navigate} onReturnHome={returnToLanding} />
      )}
      {currentScreen === 'builder' && (
        <BuilderPopup
          onBack={goBack}
          onSelectCoder={handleSelectCoder}
          onSelectGuide={handleSelectCodeGuide}
          onReturnHome={returnToLanding}
        />
      )}
      {currentScreen === 'mentor' && (
        <MentorPopup
          onBack={goBack}
          onNavigate={navigate}
          onReturnHome={returnToLanding}
        />
      )}
      {currentScreen === 'individual' && (
        <IndividualPopup
          onBack={goBack}
          onSelectProgrammer={handleSelectProgrammer}
          onSelectSpecialEd={handleSelectSpecialEdTeacher}
          onReturnHome={returnToLanding}
        />
      )}
      {currentScreen === 'organization' && (
        <OrganizationPopup
          onBack={goBack}
          onSelectSchool={handleSelectSchool}
          onSelectCenter={handleSelectSpecializedCenter}
          onReturnHome={returnToLanding}
        />
      )}
    </div>
  );
};

// ==================== SCREEN 1: MAIN PAGE ====================
function MainPage({
  onNavigate,
  onReturnHome,
}: {
  onNavigate: (screen: RoleJourneyScreen) => void;
  onReturnHome: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F6F3EE] flex flex-col font-sans">
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col animate-in fade-in duration-700">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 text-[#172238] font-bold text-[22px] tracking-tight mb-1 cursor-pointer" onClick={onReturnHome}>
              <img
                src="/logo.svg"
                alt="CodeRa Logo"
                className="h-10 w-auto object-contain"
                onError={(event) => {
                  event.currentTarget.src = '/logo.png';
                }}
              />
              <span className="text-[#172238] font-serif font-black text-2xl">CodeRa</span>
            </div>
            <p className="text-[#737D8F] text-[13px] font-medium tracking-wide">
              Code Today. Create Tomorrow. &bull; المسار التفاعلي لتحديد الأدوار
            </p>
          </div>

          <button
            onClick={onReturnHome}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-[#D8D0C5] bg-white text-xs font-bold text-[#5D6B82] hover:text-[#6366F1] hover:border-[#6366F1] transition-all shadow-sm"
          >
            <Home size={14} />
            <span>Landing Page / الرئيسية</span>
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center flex-1 my-auto">
          <div className="flex-1 w-full text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-4">
              <Sparkles size={14} />
              <span>Interactive Role Discovery &bull; اختر مسارك المناسب</span>
            </div>

            <h1 className="text-5xl lg:text-[72px] text-[#172238] font-serif font-bold leading-[1.1] mb-6">
              What's your
              <br />
              <span className="text-[#6366F1]">coding role?</span>
            </h1>
            <p className="text-[#687286] text-lg lg:text-[22px] max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
              Choose your path and let's build a better, more inclusive future together.
            </p>

            <div className="mt-12 hidden lg:flex bg-white rounded-3xl p-6 border border-[#E8E1D8] max-w-[420px] items-center gap-5 shadow-[0_18px_45px_rgba(31,41,55,0.08)]">
              <div
                style={{ backgroundColor: '#EEF2FF' }}
                className="text-[#6366F1] w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm"
              >
                <Heart size={24} fill="currentColor" />
              </div>
              <div className="flex flex-col justify-center text-left">
                <p className="text-[#7C8493] text-sm mb-0.5">Different roles. One mission.</p>
                <p className="text-[#172238] text-[17px] font-medium">
                  Building <span className="text-[#6366F1] font-bold">brighter futures</span> through code.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col gap-6 max-w-[560px]">
            {/* BUILDER CARD */}
            <button
              type="button"
              onClick={() => onNavigate('builder')}
              className="group text-left bg-white rounded-[30px] p-3 pr-8 flex items-center gap-6 border border-[#E4DDD3] shadow-[0_14px_35px_rgba(31,41,55,0.08)] hover:shadow-[0_25px_55px_rgba(99,102,241,0.25)] hover:border-[#C7D2FE] transition-all duration-500 transform hover:-translate-y-2 w-full cursor-pointer"
            >
              <div className="w-36 h-36 rounded-[22px] overflow-hidden shrink-0 bg-[#F3F0EA] shadow-inner">
                <ImageWithFallback
                  src={IMAGES.builderRole}
                  fallbackKey="builderRole"
                  alt="Builder"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex-1 py-2">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] text-[11px] font-extrabold uppercase tracking-wider mb-1">
                  Learn & Create
                </div>
                <h3 className="text-[#6366F1] text-[28px] font-serif font-black mb-1 tracking-tight">
                  BUILDER
                </h3>
                <p className="text-[#5D6B82] text-base leading-tight font-medium">
                  I'm here to learn, create &amp; build interactive programs.
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-[#6366F1] text-white flex items-center justify-center shrink-0 group-hover:scale-110 shadow-lg shadow-indigo-500/30 transition-all duration-500">
                <ArrowRight size={26} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* MENTOR CARD */}
            <button
              type="button"
              onClick={() => onNavigate('mentor')}
              className="group text-left bg-white rounded-[30px] p-3 pr-8 flex items-center gap-6 border border-[#E4DDD3] shadow-[0_14px_35px_rgba(31,41,55,0.08)] hover:shadow-[0_25px_55px_rgba(13,148,136,0.25)] hover:border-[#99F6E4] transition-all duration-500 transform hover:-translate-y-2 w-full cursor-pointer"
            >
              <div className="w-36 h-36 rounded-[22px] overflow-hidden shrink-0 bg-[#F3F0EA] shadow-inner">
                <ImageWithFallback
                  src={IMAGES.mentorRole}
                  fallbackKey="mentorRole"
                  alt="Mentor"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex-1 py-2">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0D9488] text-[11px] font-extrabold uppercase tracking-wider mb-1">
                  Support & Track
                </div>
                <h3 className="text-[#0D9488] text-[28px] font-serif font-black mb-1 tracking-tight">
                  MENTOR
                </h3>
                <p className="text-[#5D6B82] text-base leading-tight font-medium">
                  I'm here to support, track, teach &amp; empower students.
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-[#0D9488] text-white flex items-center justify-center shrink-0 group-hover:scale-110 shadow-lg shadow-teal-500/30 transition-all duration-500">
                <ArrowRight size={26} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Footer Bar */}
      <div className="bg-[#EEE9E1] border-t border-[#DED7CC] py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Feature
            icon={<Rocket size={26} strokeWidth={1.75} className="text-[#6366F1]" />}
            title="Personalized Experience"
            description="We tailor everything to your learning pace and diagnostic needs."
          />
          <Feature
            icon={<Puzzle size={26} strokeWidth={1.75} className="text-[#0D9488]" />}
            title="Inclusive by Design"
            description="Built for every learner, neurodivergent strengths &amp; SEN students."
          />
          <Feature
            icon={<Trophy size={26} strokeWidth={1.75} className="text-amber-500" />}
            title="Real Skills, Real Impact"
            description="From visual blocks &amp; robotics to Python &amp; AI capstones."
          />
          <Feature
            icon={<Users size={26} strokeWidth={1.75} className="text-purple-600" />}
            title="Stronger Together"
            description="A supportive community for students, parents &amp; specialists."
          />
        </div>
      </div>

      <footer className="bg-[#E7E1D8] py-6 border-t border-[#D8D0C5]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#697386]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#172238]">CodeRa Platform</span>
            <span>&copy; 2026 CodeRa. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <button onClick={onReturnHome} className="hover:text-indigo-600 font-semibold transition-colors">
              Platform Home
            </button>
            <a href="#tracks-section" className="hover:text-indigo-600 transition-colors">Career Pathways</a>
            <a href="#aboutTitle" className="hover:text-indigo-600 transition-colors">About Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#E4DDD3]">
        {icon}
      </div>
      <div>
        <p className="font-bold text-[#293348] text-[15px] mb-0.5">{title}</p>
        <p className="text-[#7A8494] text-[13px] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ==================== SHARED POPUP MODAL WRAPPER ====================
function PopupLayout({
  children,
  onBack,
  onReturnHome,
  footerText,
  isBuilderTheme = true,
  dotsColor = '#E0E0E0',
  activeStep = 1,
  totalSteps = 2,
}: {
  children: React.ReactNode;
  onBack: () => void;
  onReturnHome?: () => void;
  footerText: string;
  isBuilderTheme?: boolean;
  dotsColor?: string;
  activeStep?: number;
  totalSteps?: number;
}) {
  const activeColor = isBuilderTheme ? '#6366F1' : '#0D9488';

  return (
    <div className="min-h-screen bg-[#EAE6DF] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="bg-white w-full max-w-[840px] rounded-[40px] shadow-[0_30px_80px_rgba(31,41,55,0.15)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border border-[#E7E1D8]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-8 pb-4 shrink-0 relative border-b border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#1C2840] hover:bg-[#F4F1EC] transition-colors z-10 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#0B152A] cursor-pointer" onClick={onReturnHome}>
            <img
              src="/logo.svg"
              alt="CodeRa Logo"
              className="h-8 w-auto object-contain"
              onError={(event) => {
                event.currentTarget.src = '/logo.png';
              }}
            />
            <span className="font-serif font-black text-2xl">CodeRa</span>
          </div>

          <div className="flex items-center gap-2 z-10">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: index + 1 === activeStep ? activeColor : dotsColor,
                  width: index + 1 === activeStep ? '28px' : '8px',
                }}
                className="h-2.5 rounded-full transition-all duration-300"
              />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 pt-6 flex-1">{children}</div>

        {/* Modal Footer */}
        <div className="border-t border-[#F0F2F5] p-5 px-8 flex items-center justify-between shrink-0 bg-slate-50/50">
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Previous Step / الخطوة السابقة</span>
          </button>
          <p className="text-[13px] font-black tracking-wider uppercase" style={{ color: activeColor }}>
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== SCREEN 2A: BUILDER (Coder vs Code Guide) ====================
function BuilderPopup({
  onBack,
  onSelectCoder,
  onSelectGuide,
  onReturnHome,
}: {
  onBack: () => void;
  onSelectCoder: () => void;
  onSelectGuide: () => void;
  onReturnHome: () => void;
}) {
  return (
    <PopupLayout
      onBack={onBack}
      onReturnHome={onReturnHome}
      footerText="Builder Journey (Step 1 of 1)"
      isBuilderTheme={true}
      activeStep={1}
      totalSteps={1}
    >
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-[#6366F1] text-xs font-extrabold rounded-full mb-2">
          Builder Track &bull; مسار البناء والتعلم
        </span>
        <h2 className="text-[34px] font-serif font-bold text-[#0B152A] mb-2">
          Who's building with us?
        </h2>
        <p className="text-[#5D6B82] text-[17px] font-serif italic">
          Tell us who you are so we can personalize your experience.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 justify-center px-2">
        <SelectionCard
          image={IMAGES.coder}
          fallbackKey="coder"
          title="CODER"
          arabicTitle="الطالب المبرمج"
          badge="Gamified Assessment"
          description="I'm a student here to learn, create &amp; take my 50-question placement test."
          actionText="Start Student Test 🚀"
          colorTheme="purple"
          bgTint="bg-[#FAFAFF]"
          onClick={onSelectCoder}
        />
        <SelectionCard
          image={IMAGES.guide}
          fallbackKey="guide"
          title="CODE GUIDE"
          arabicTitle="المرشد وولي الأمر"
          badge="Family & Care Portal"
          description="I'm a parent or guide here to configure accommodations, track &amp; empower."
          actionText="Open Parent Portal 👨‍👩‍👧‍👦"
          colorTheme="teal"
          bgTint="bg-[#F6FEFD]"
          onClick={onSelectGuide}
        />
      </div>
    </PopupLayout>
  );
}

// ==================== SCREEN 2B: MENTOR STEP 1 (Individual vs Org) ====================
function MentorPopup({
  onBack,
  onNavigate,
  onReturnHome,
}: {
  onBack: () => void;
  onNavigate: (screen: RoleJourneyScreen) => void;
  onReturnHome: () => void;
}) {
  return (
    <PopupLayout
      onBack={onBack}
      onReturnHome={onReturnHome}
      footerText="Mentor Journey (Step 1 of 2)"
      isBuilderTheme={false}
      activeStep={1}
      totalSteps={2}
    >
      <div className="text-center mb-10">
        <span className="inline-block px-3 py-1 bg-teal-50 text-[#0D9488] text-xs font-extrabold rounded-full mb-2">
          Mentor Track &bull; مسار التوجيه والتمكين
        </span>
        <h2 className="text-[34px] font-serif font-bold text-[#0B152A] mb-2 leading-tight">
          How are you joining <span className="text-[#0D9488]">CodeRa</span>?
        </h2>
        <p className="text-[#5D6B82] text-[17px] font-serif italic mt-1">
          Choose your journey so we can serve you better.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-[700px] mx-auto px-2">
        <IconSelectionCard
          icon={<User size={48} strokeWidth={2} />}
          title="INDIVIDUAL"
          arabicTitle="فردي (مبرمج / معلم تربية خاصة)"
          description="My personal professional journey"
          colorTheme="teal"
          onClick={() => onNavigate('individual')}
        />
        <IconSelectionCard
          icon={<Building2 size={44} strokeWidth={2} />}
          title="ORGANIZATION"
          arabicTitle="مؤسسي (مدرسة / مركز متخصص)"
          description="Our organization's inclusive journey"
          colorTheme="purple"
          onClick={() => onNavigate('organization')}
        />
      </div>
    </PopupLayout>
  );
}

// ==================== SCREEN 3A: INDIVIDUAL STEP 2 (Programmer vs Special Ed) ====================
function IndividualPopup({
  onBack,
  onSelectProgrammer,
  onSelectSpecialEd,
  onReturnHome,
}: {
  onBack: () => void;
  onSelectProgrammer: () => void;
  onSelectSpecialEd: () => void;
  onReturnHome: () => void;
}) {
  return (
    <PopupLayout
      onBack={onBack}
      onReturnHome={onReturnHome}
      footerText="Individual Journey (Step 2 of 2)"
      isBuilderTheme={false}
      activeStep={2}
      totalSteps={2}
    >
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 bg-teal-50 text-[#0D9488] text-xs font-extrabold rounded-full mb-2">
          Individual Path &bull; المسار الفردي
        </span>
        <h2 className="text-[34px] font-serif font-bold text-[#0B152A] mb-2">
          What brings you to <span className="text-[#6366F1]">CodeRa</span>?
        </h2>
        <p className="text-[#5D6B82] text-[17px] font-serif italic">
          Tell us more about your background &amp; mission.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 justify-center px-2">
        <SelectionCard
          image={IMAGES.programmer}
          fallbackKey="programmer"
          title="PROGRAMMER"
          arabicTitle="مبرمج / مطور تقني"
          badge="Curriculum & Tech"
          description="I'm a software developer and I want to learn and contribute to coding for inclusion."
          actionText="Explore Inclusive Tracks 💻"
          colorTheme="purple"
          onClick={onSelectProgrammer}
        />
        <SelectionCard
          image={IMAGES.teacher}
          fallbackKey="teacher"
          title="SPECIAL EDUCATION TEACHER"
          arabicTitle="أخصائي / معلم تربية خاصة"
          badge="Pro Specialist Portal"
          description="I work with learners with special educational needs (SEN) &amp; want assessment tools."
          actionText="Access Pro Dashboard 🩺"
          colorTheme="teal"
          onClick={onSelectSpecialEd}
        />
      </div>
    </PopupLayout>
  );
}

// ==================== SCREEN 3B: ORGANIZATION STEP 2 (School vs Center) ====================
function OrganizationPopup({
  onBack,
  onSelectSchool,
  onSelectCenter,
  onReturnHome,
}: {
  onBack: () => void;
  onSelectSchool: () => void;
  onSelectCenter: () => void;
  onReturnHome: () => void;
}) {
  return (
    <PopupLayout
      onBack={onBack}
      onReturnHome={onReturnHome}
      footerText="Organization Journey (Step 2 of 2)"
      isBuilderTheme={true}
      activeStep={2}
      totalSteps={2}
    >
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-[#6366F1] text-xs font-extrabold rounded-full mb-2">
          Organization Path &bull; مسار الشراكات المؤسسية
        </span>
        <h2 className="text-[34px] font-serif font-bold text-[#0B152A] mb-2 leading-tight">
          What does your <span className="text-[#0D9488]">organization</span> do?
        </h2>
        <p className="text-[#5D6B82] text-[17px] font-serif italic">
          Tell us more about your educational mission &amp; partnership needs.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 justify-center px-2">
        <SelectionCard
          image={IMAGES.school}
          fallbackKey="school"
          title="SCHOOL"
          arabicTitle="مدرسة / أكاديمية تعليمية"
          badge="School Licensing"
          description="We want to bring inclusive robotics &amp; AI placement assessment to our students."
          actionText="School Partnership 🏫"
          colorTheme="teal"
          iconTopLeft={<GraduationCap size={16} strokeWidth={2.5} />}
          onClick={onSelectSchool}
        />
        <SelectionCard
          image={IMAGES.center}
          fallbackKey="center"
          title="SPECIALIZED CENTER"
          arabicTitle="مركز رعاية وتأهيل متخصص"
          badge="SEN Center Partnership"
          description="We support learners with autism, ADHD, or learning differences through tailored tech."
          actionText="SEN Center Request 🏥"
          colorTheme="purple"
          iconTopLeft={<Heart size={16} strokeWidth={2.5} fill="currentColor" />}
          onClick={onSelectCenter}
        />
      </div>
    </PopupLayout>
  );
}

// ==================== CARD COMPONENTS ====================
interface SelectionCardProps {
  image: string;
  fallbackKey: FallbackKey;
  title: string;
  arabicTitle?: string;
  badge?: string;
  description: string;
  actionText?: string;
  colorTheme: 'purple' | 'teal';
  bgTint?: string;
  iconTopLeft?: React.ReactNode;
  onClick: () => void;
}

function SelectionCard({
  image,
  fallbackKey,
  title,
  arabicTitle,
  badge,
  description,
  actionText,
  colorTheme,
  bgTint = 'bg-white',
  iconTopLeft,
  onClick,
}: SelectionCardProps) {
  const isPurple = colorTheme === 'purple';
  const textClass = isPurple ? 'text-[#6366F1]' : 'text-[#0D9488]';
  const btnClass = isPurple
    ? 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-indigo-500/25'
    : 'bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-teal-500/25';
  const iconBgColor = isPurple ? '#EEF2FF' : '#CCFBF1';

  return (
    <div
      onClick={onClick}
      className={`flex-1 w-full max-w-sm ${bgTint} rounded-[28px] border border-[#E4DDD3] p-4 pb-6 text-center flex flex-col items-center group cursor-pointer transition-all duration-500 shadow-[0_12px_30px_rgba(31,41,55,0.06)] hover:shadow-[0_22px_45px_rgba(31,41,55,0.14)] hover:-translate-y-2`}
    >
      <div className="w-full h-[180px] rounded-2xl overflow-hidden mb-5 relative bg-slate-100 shadow-inner shrink-0 flex items-center justify-center">
        <ImageWithFallback
          src={image}
          fallbackKey={fallbackKey}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {iconTopLeft && (
          <div
            style={{ backgroundColor: iconBgColor }}
            className={`${textClass} absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md`}
          >
            {iconTopLeft}
          </div>
        )}
        {badge && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-[#172238] shadow-md border border-slate-100">
            {badge}
          </div>
        )}
      </div>

      <h3 className={`${textClass} text-[18px] font-black mb-0.5 tracking-wider uppercase font-serif`}>
        {title}
      </h3>
      {arabicTitle && (
        <p className="text-[13px] font-bold text-slate-500 mb-2">{arabicTitle}</p>
      )}

      <p className="text-[#5D6B82] text-[14px] px-2 mb-5 flex-1 leading-relaxed min-h-[44px] flex items-center justify-center">
        {description}
      </p>

      <div className={`w-full py-3 px-4 rounded-xl ${btnClass} font-bold text-sm shadow-md flex items-center justify-center gap-2 group-hover:scale-102 transition-all`}>
        <span>{actionText || 'Select & Continue'}</span>
        <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

interface IconSelectionCardProps {
  icon: React.ReactNode;
  title: string;
  arabicTitle?: string;
  description: string;
  colorTheme: 'purple' | 'teal';
  onClick: () => void;
}

function IconSelectionCard({
  icon,
  title,
  arabicTitle,
  description,
  colorTheme,
  onClick,
}: IconSelectionCardProps) {
  const isPurple = colorTheme === 'purple';
  const textClass = isPurple ? 'text-[#6366F1]' : 'text-[#0D9488]';
  const btnClass = isPurple ? 'bg-[#6366F1]' : 'bg-[#0D9488]';

  return (
    <div
      onClick={onClick}
      className="flex-1 bg-white rounded-[32px] border border-[#E4DDD3] p-8 text-center flex flex-col items-center justify-between group cursor-pointer transition-all duration-500 hover:shadow-[0_22px_50px_rgba(31,41,55,0.12)] hover:-translate-y-2 min-h-[340px] shadow-[0_12px_30px_rgba(31,41,55,0.06)]"
    >
      <div className={`${btnClass} text-white w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <h3 className={`${textClass} text-[16px] font-black mb-1 tracking-[0.15em] uppercase font-serif`}>
          {title}
        </h3>
        {arabicTitle && (
          <p className="text-xs font-bold text-slate-500 mb-2">{arabicTitle}</p>
        )}
        <p className="text-[#5D6B82] font-serif text-[17px] italic mb-6">
          {description}
        </p>
      </div>
      <div className={`${btnClass} text-white w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-md`}>
        <ArrowRight size={18} strokeWidth={2.5} />
      </div>
    </div>
  );
}
